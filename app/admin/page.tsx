"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  addService,
  deleteBooking,
  deleteBookingsByDate,
  deleteOldBookings,
  deleteService,
  getBookings,
  getServices,
  getSettings,
  saveSettings,
  updateBookingStatus,
  updateService,
} from "@/lib/storage";

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const statusOrder: any = {
  waiting: 1,
  completed: 2,
  cancelled: 3,
};

export default function Admin() {
  const today = new Date().toISOString().split("T")[0];

  const [logged, setLogged] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [settings, setSettings] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
const [services, setServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
const [newServicePrice, setNewServicePrice] = useState("");

const [editingServiceId, setEditingServiceId] = useState("");
const [editServiceName, setEditServiceName] = useState("");
const [editServicePrice, setEditServicePrice] = useState("");
  const loadBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
  setLogged(true);
}

if (data.user?.email) {
  const { data: adminData } = await supabase
    .from("admins")
    .select("role")
    .eq("email", data.user.email)
    .single();

  setRole(adminData?.role || "staff");
}

      const s = await getSettings();
      setSettings(s);

      await loadBookings();
      setAuthLoading(false);
    };

    load();
  }, []);



useEffect(() => {
  const channel = supabase
    .channel("bookings-live-admin")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bookings",
      },
      async () => {
        try {
          const audio = new Audio("/notification.mp3");
          audio.volume = 0.7;
          await audio.play();
        } catch {}

        await loadBookings();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const login = async () => {
  if (!email.trim() || !password.trim()) {
    alert("اكتب الإيميل والباسورد");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    alert("❌ الإيميل أو الباسورد غلط");
    return;
  }

  setLogged(true);
};

// 👇 دي تضيفها بعد login مباشرة
const resetPassword = async () => {
  if (!email.trim()) {
    alert("اكتب الإيميل الأول");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: "https://salon24-beryl.vercel.app/reset-password",
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ تم إرسال رابط استرجاع الباسورد على الإيميل");
};

  const logout = async () => {
    await supabase.auth.signOut();
    setLogged(false);
    setEmail("");
    setPassword("");
  };

  const updateSettings = async (s: any) => {
    setSettings(s);

    try {
      await saveSettings(s);
    } catch {
      alert("❌ حصل خطأ أثناء حفظ الإعدادات");
    }
  };

 const refreshBookings = async () => {
  await loadBookings();
};

  const changeBookingStatus = async (
    id: string,
    status: "waiting" | "completed" | "cancelled"
  ) => {
    const updated = await updateBookingStatus(id, status);
    setBookings(updated);
  };

  const handleDeleteBooking = async (id: string) => {
    const ok = confirm("متأكد إنك عايز تحذف الحجز نهائيًا؟");
    if (!ok) return;

    try {
      const updated = await deleteBooking(id);
      setBookings(updated);
      alert("✅ تم حذف الحجز");
    } catch {
      alert("❌ حصل خطأ أثناء حذف الحجز");
    }
  };

  const handleClearSelectedDay = async () => {
    if (!selectedDate) {
      alert("اختار تاريخ الأول");
      return;
    }

    const ok = confirm(`متأكد إنك عايز تحذف كل حجوزات يوم ${selectedDate}؟`);
    if (!ok) return;

    try {
      const updated = await deleteBookingsByDate(selectedDate);
      setBookings(updated);
      alert("✅ تم تفريغ اليوم المحدد");
    } catch {
      alert("❌ حصل خطأ أثناء تفريغ اليوم");
    }
  };

  const handleDeleteOldBookings = async () => {
    const ok = confirm("متأكد إنك عايز تحذف كل الحجوزات القديمة؟");
    if (!ok) return;

    try {
      const updated = await deleteOldBookings(today);
      setBookings(updated);
      alert("✅ تم حذف الحجوزات القديمة");
    } catch {
      alert("❌ حصل خطأ أثناء حذف الحجوزات القديمة");
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      alert("اكتب اسم الخدمة");
      return;
    }

    try {
      await addService(newServiceName.trim(), Number(newServicePrice || 0));
      setNewServiceName("");
      setNewServicePrice("");
      await loadServices();
      alert("✅ تم إضافة الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء إضافة الخدمة");
    }
  };

  const startEditService = (s: any) => {
    setEditingServiceId(s.id);
    setEditServiceName(s.name);
    setEditServicePrice(String(s.price || 0));
  };

  const handleUpdateService = async () => {
    if (!editingServiceId || !editServiceName.trim()) {
      alert("اكتب اسم الخدمة");
      return;
    }

    try {
      await updateService(
        editingServiceId,
        editServiceName.trim(),
        Number(editServicePrice || 0)
      );

      setEditingServiceId("");
      setEditServiceName("");
      setEditServicePrice("");
      await loadServices();
      alert("✅ تم تعديل الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء تعديل الخدمة");
    }
  };

  const handleDeleteService = async (id: string) => {
    const ok = confirm("متأكد إنك عايز تحذف الخدمة؟");
    if (!ok) return;

    try {
      await deleteService(id);
      await loadServices();
      alert("✅ تم حذف الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء حذف الخدمة");
    }
  };

  const applyFilters = (list: any[]) => {
    return list
      .filter((b) =>
        statusFilter === "all" ? true : b.status === statusFilter
      )
      .filter((b) => {
        const q = search.trim();
        if (!q) return true;

        return (
          b.name?.includes(q) ||
          b.phone?.includes(q) ||
          b.service?.includes(q)
        );
      })
      .sort((a, b) => {
        const statusDiff =
          (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);

        if (statusDiff !== 0) return statusDiff;
        return a.time.localeCompare(b.time);
      });
  };

  const todayBookings = bookings
    .filter((b) => b.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const activeTodayBookings = todayBookings.filter(
    (b) => b.status !== "cancelled"
  );

  const selectedDateBookings = selectedDate
    ? bookings.filter((b) => b.date === selectedDate)
    : [];

  const filteredSelectedDateBookings = applyFilters(selectedDateBookings);

 const getBookingTotal = (serviceText: string) => {
  const match = serviceText?.match(/الإجمالي:\s*(\d+)/);
  return match ? Number(match[1]) : 0;
};

const completedBookings = bookings.filter((b) => b.status === "completed");

const todayCompletedBookings = completedBookings.filter(
  (b) => b.date === today
);

const monthKey = today.slice(0, 7);

const monthCompletedBookings = completedBookings.filter((b) =>
  b.date?.startsWith(monthKey)
);

const todayRevenue = todayCompletedBookings.reduce(
  (total, b) => total + getBookingTotal(b.service),
  0
);

const monthRevenue = monthCompletedBookings.reduce(
  (total, b) => total + getBookingTotal(b.service),
  0
);

const cancelledToday = todayBookings.filter(
  (b) => b.status === "cancelled"
).length;

const topServiceName = (() => {
  const counts: any = {};

  bookings.forEach((b) => {
    if (!b.service) return;

    const beforeTotal = b.service.split("|")[0];
    const items = beforeTotal.split(" + ");

    items.forEach((item: string) => {
      const cleanName = item.replace(/\(.*?\)/g, "").trim();
      if (!cleanName) return;

      counts[cleanName] = (counts[cleanName] || 0) + 1;
    });
  });

  const sorted = Object.entries(counts).sort(
    (a: any, b: any) => Number(b[1]) - Number(a[1])
  );

  return sorted[0]?.[0] || "لا يوجد";
})();
  const renderServices = (serviceText: string) => {
    const items = serviceText?.split(" + ") || [];

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {items.map((s: string, index: number) => (
          <span
            key={`${s}-${index}`}
            className="bg-[#d4af37]/15 text-[#fff3b0] border border-[#d4af37]/20 px-2 py-1 rounded-lg text-xs font-bold"
          >
            {s}
          </span>
        ))}
      </div>
    );
  };

  const renderBookingCard = (b: any) => (
    <div
      key={b.id}
      className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xl font-black">{b.name}</p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              b.status === "completed"
                ? "bg-green-500/15 text-green-300"
                : b.status === "cancelled"
                ? "bg-red-500/15 text-red-300"
                : "bg-blue-500/15 text-blue-300"
            }`}
          >
            {b.status === "completed"
              ? "تم"
              : b.status === "cancelled"
              ? "ملغي"
              : "منتظر"}
          </span>
        </div>

        <p className="text-slate-300">📞 {b.phone}</p>
        <p className="text-slate-300 mt-1">الخدمات:</p>
        {renderServices(b.service)}

        <p className="text-[#fff3b0] font-bold mt-2">
          {b.date} - {formatTime(b.time)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`tel:${b.phone}`}
          className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold"
        >
          اتصل
        </a>

        <a
          href={`https://wa.me/2${b.phone}?text=${encodeURIComponent(
            `أهلاً ${b.name}، معاك Salon24 بخصوص حجزك الساعة ${formatTime(
              b.time
            )}`
          )}`}
          target="_blank"
          className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold"
        >
          واتساب
        </a>

        {b.status !== "completed" && (
          <button
            onClick={() => changeBookingStatus(b.id, "completed")}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"
          >
            تم
          </button>
        )}

        {b.status !== "cancelled" && (
          <button
            onClick={() => changeBookingStatus(b.id, "cancelled")}
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            إلغاء
          </button>
        )}

        {b.status !== "waiting" && (
          <button
            onClick={() => changeBookingStatus(b.id, "waiting")}
            className="bg-slate-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            إرجاع
          </button>
        )}

        <button
          onClick={() => handleDeleteBooking(b.id)}
          className="bg-black border border-red-500 text-red-400 px-4 py-2 rounded-xl font-bold"
        >
          حذف نهائي
        </button>
      </div>
    </div>
  );

  if (authLoading || !settings) return null;

  if (!logged) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
      >
        <div className="w-full max-w-sm rounded-[2rem] border border-[#d4af37]/20 bg-white/[0.07] backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <img
            src="/logo.png"
            alt="Salon24"
            className="mx-auto w-24 h-24 object-cover rounded-3xl border border-[#d4af37]/25 shadow-[0_20px_60px_rgba(212,175,55,0.22)]"
          />

          <h1 className="text-4xl font-black text-center tracking-[0.15em] bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
            SALON 24
          </h1>

          <p className="text-center text-slate-400">تسجيل دخول الأدمن</p>

          <input
            type="email"
            placeholder="الإيميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-black/35 border border-white/10 rounded-2xl outline-none focus:border-[#d4af37]"
          />

          <input
            type="password"
            placeholder="الباسورد"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-black/35 border border-white/10 rounded-2xl outline-none focus:border-[#d4af37]"
          />

          <button
            onClick={login}
            className="w-full bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black p-4 rounded-2xl font-black"
          >
            دخول
          </button>


          <button
  onClick={resetPassword}
  className="w-full text-[#fff3b0] text-sm font-bold underline mt-2"
>
  نسيت الباسورد؟
</button>

        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4 relative overflow-x-hidden"
    >
      {settingsOpen && (
        <div className="fixed inset-0 z-40">
          <div
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#07111f] border-l border-[#d4af37]/20 p-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-[#fff3b0]">
                  إعدادات النظام
                </h2>
                <p className="text-slate-400 text-sm">
                  الخدمات - الباسورد - المواعيد
                </p>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="bg-red-500 px-4 py-2 rounded-xl font-bold"
              >
                إغلاق
              </button>
            </div>

          <div className="space-y-3">
  <a href="/admin/settings/booking" className="block w-full text-center bg-white/[0.07] border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black">
    المواعيد والحجز
  </a>

  <a href="/admin/settings/services" className="block w-full text-center bg-white/[0.07] border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black">
    الخدمات والأسعار
  </a>

  <a href="/admin/settings/bookings" className="block w-full text-center bg-white/[0.07] border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black">
    إدارة الحجوزات
  </a>

  {role === "owner" && (
  <a
    href="/admin/admins"
    className="block w-full text-center bg-white/[0.07] border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black"
  >
    الأدمنز والصلاحيات
  </a>
)}

  <a href="/admin/settings/notifications" className="block w-full text-center bg-white/[0.07] border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black">
    الإشعارات
  </a>

  <button
    onClick={logout}
    className="w-full bg-black border border-red-500 text-red-400 p-4 rounded-2xl font-black"
  >
    تسجيل خروج
  </button>
</div>
</div>
</div>
)}

      <div className="max-w-6xl mx-auto space-y-5 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Salon24"
              className="w-16 h-16 object-cover rounded-2xl border border-[#d4af37]/25 shadow-[0_15px_40px_rgba(212,175,55,0.18)]"
            />

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
                SALON 24
              </h1>
              <p className="text-slate-400 text-sm">لوحة التحكم</p>
            </div>
          </div>

         <div className="flex items-center gap-2">

  <a
    href="/admin/reports"
    className="bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black px-5 py-3 rounded-2xl font-black"
  >
    التقارير
  </a>



  <button
    onClick={() => setSettingsOpen(true)}
    className="w-14 h-14 rounded-2xl border border-[#d4af37]/25 bg-white/[0.07] text-[#fff3b0] text-3xl font-black flex items-center justify-center"
    title="الإعدادات"
  >
    ☰
  </button>

</div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">

          <button
            onClick={refreshBookings}
            className="bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black px-5 py-3 rounded-2xl font-black"
          >
            تحديث البيانات
          </button>
        </div>

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">حجوزات اليوم</p>
    <p className="text-4xl font-black mt-2">
      {activeTodayBookings.length}
    </p>
  </div>

  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">أرباح اليوم</p>
    <p className="text-3xl font-black mt-2 text-[#fff3b0]">
      {todayRevenue} ج
    </p>
  </div>

  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">أرباح الشهر</p>
    <p className="text-3xl font-black mt-2 text-[#fff3b0]">
      {monthRevenue} ج
    </p>
  </div>

  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">المتبقي اليوم</p>
    <p className="text-4xl font-black mt-2">
      {settings.maxPerDay - activeTodayBookings.length}
    </p>
  </div>

  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">إلغاءات اليوم</p>
    <p className="text-4xl font-black mt-2 text-red-300">
      {cancelledToday}
    </p>
  </div>

  <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-3xl">
    <p className="text-slate-300">الأكثر طلبًا</p>
    <p className="text-lg font-black mt-3 text-[#fff3b0]">
      {topServiceName}
    </p>
  </div>
</div>

        <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-[2rem]">
          <h2 className="text-2xl font-black mb-4 text-[#fff3b0]">
            حجوزات اليوم
          </h2>

          {todayBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              لا توجد حجوزات اليوم
            </p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(renderBookingCard)}
            </div>
          )}
        </div>

        <div className="bg-white/[0.07] border border-[#d4af37]/15 backdrop-blur-xl p-5 rounded-[2rem]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black text-[#fff3b0]">
                عرض حجوزات تاريخ معين
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                اختار تاريخ مختلف عن اليوم عشان يظهر هنا
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
            />
          </div>

          {selectedDate && (
            <>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <input
                  placeholder="بحث بالاسم أو رقم الموبايل أو الخدمة"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="waiting">منتظر</option>
                  <option value="completed">تم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              {filteredSelectedDateBookings.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  لا توجد حجوزات مطابقة
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredSelectedDateBookings.map(renderBookingCard)}
                </div>
              )}
            </>
          )}

          {!selectedDate && (
            <p className="text-slate-400 text-center py-8">
              اختار تاريخ لعرض الحجوزات القديمة أو القادمة
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
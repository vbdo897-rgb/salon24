"use client";

import { useEffect, useState } from "react";
import {
  getBookings,
  getSettings,
  saveSettings,
  updateBookingStatus,
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
  const [code, setCode] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [newTime, setNewTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPassword, setNewPassword] = useState("");

  const loadBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  useEffect(() => {
    setSettings(getSettings());
    loadBookings();
  }, []);

  const login = () => {
    const adminPassword = settings?.adminPassword || "1234";

    if (code === adminPassword) setLogged(true);
    else alert("❌ كود غلط");
  };

  const updateSettings = (s: any) => {
    setSettings(s);
    saveSettings(s);
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

  const selectedDateBookings = bookings.filter((b) => b.date === selectedDate);

  const filteredSelectedDateBookings = applyFilters(selectedDateBookings);

  const renderServices = (serviceText: string) => {
    const items = serviceText?.split(" + ") || [];

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {items.map((s: string) => (
          <span
            key={s}
            className="bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 px-2 py-1 rounded-lg text-xs font-bold"
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
      className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
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

        <p className="text-yellow-400 font-bold mt-2">
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
      </div>
    </div>
  );

  if (!settings) return null;

  if (!logged) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#24324f_0,#08111f_45%,#020617_100%)] text-white p-4"
      >
        <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <h1 className="text-3xl font-black text-center">Salon24 Admin</h1>

          <input
            type="password"
            placeholder="كود الأدمن"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 bg-slate-950/60 border border-white/10 rounded-2xl outline-none focus:border-yellow-400"
          />

          <button
            onClick={login}
            className="w-full bg-yellow-500 text-black p-4 rounded-2xl font-black"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0,#08111f_45%,#020617_100%)] text-white p-4"
    >
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black">لوحة تحكم Salon24</h1>
            <p className="text-slate-400 mt-1">
              إدارة الحجوزات والمواعيد اليومية
            </p>
          </div>

          <button
            onClick={refreshBookings}
            className="bg-yellow-500 text-black px-5 py-3 rounded-2xl font-black"
          >
            تحديث البيانات
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-3xl">
            <p className="text-slate-300">حجوزات اليوم</p>
            <p className="text-4xl font-black mt-2">
              {activeTodayBookings.length}
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-3xl">
            <p className="text-slate-300">الحد اليومي</p>
            <p className="text-4xl font-black mt-2">{settings.maxPerDay}</p>
          </div>

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-3xl">
            <p className="text-slate-300">المتبقي اليوم</p>
            <p className="text-4xl font-black mt-2">
              {settings.maxPerDay - activeTodayBookings.length}
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-3xl">
            <p className="text-slate-300">حالة الحجز</p>
            <p className="text-2xl font-black mt-3">
              {settings.bookingOpen ? "مفتوح" : "مغلق"}
            </p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-[2rem]">
          <h2 className="text-2xl font-black mb-4">حجوزات اليوم</h2>

          {todayBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              لا توجد حجوزات اليوم
            </p>
          ) : (
            <div className="space-y-3">{todayBookings.map(renderBookingCard)}</div>
          )}
        </div>

        <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-[2rem]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black">عرض حجوزات تاريخ معين</h2>
              <p className="text-slate-400 text-sm mt-1">
                اختار تاريخ، وابحث بالاسم أو الرقم، وفلتر حسب الحالة
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <input
              placeholder="بحث بالاسم أو رقم الموبايل أو الخدمة"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-400"
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
        </div>

        <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-[2rem] space-y-4">
          <h2 className="text-2xl font-black">إعدادات النظام</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-300 mb-2 font-bold">
                عدد الزباين يوميًا
              </p>
              <input
                type="number"
                value={settings.maxPerDay}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    maxPerDay: Number(e.target.value),
                  })
                }
                className="p-4 bg-slate-950/60 border border-white/10 w-full rounded-2xl outline-none"
                placeholder="عدد الحجوزات اليومي"
              />
            </div>

            <div>
              <p className="text-slate-300 mb-2 font-bold">
                تغيير باسورد الأدمن
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-4 bg-slate-950/60 border border-white/10 flex-1 rounded-2xl outline-none"
                  placeholder="باسورد جديد"
                />

                <button
                  onClick={() => {
                    if (!newPassword.trim()) {
                      alert("اكتب باسورد جديد");
                      return;
                    }

                    updateSettings({
                      ...settings,
                      adminPassword: newPassword.trim(),
                    });

                    setNewPassword("");
                    alert("✅ تم تغيير باسورد الأدمن");
                  }}
                  className="bg-yellow-500 text-black px-5 rounded-2xl font-black"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              updateSettings({
                ...settings,
                bookingOpen: !settings.bookingOpen,
              })
            }
            className={`p-4 w-full rounded-2xl font-black ${
              settings.bookingOpen
                ? "bg-green-500 text-black"
                : "bg-red-500 text-white"
            }`}
          >
            {settings.bookingOpen ? "الحجز مفتوح" : "الحجز مغلق"}
          </button>

          <div>
            <p className="text-slate-300 mb-2 font-bold">إضافة معاد جديد</p>

            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="p-4 bg-slate-950/60 border border-white/10 flex-1 rounded-2xl outline-none"
              />

              <button
                onClick={() => {
                  if (!newTime) return;

                  if (settings.timeSlots.includes(newTime)) {
                    alert("المعاد موجود بالفعل");
                    return;
                  }

                  updateSettings({
                    ...settings,
                    timeSlots: [...settings.timeSlots, newTime].sort(),
                  });

                  setNewTime("");
                }}
                className="bg-yellow-500 text-black px-5 rounded-2xl font-black"
              >
                إضافة
              </button>
            </div>
          </div>

          <div>
            <p className="text-slate-300 mb-2 font-bold">
              المواعيد الحالية
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {settings.timeSlots.map((t: string) => (
                <div
                  key={t}
                  className="flex justify-between items-center bg-slate-950/60 border border-white/10 p-3 rounded-2xl"
                >
                  <span>{formatTime(t)}</span>

                  <button
                    onClick={() =>
                      updateSettings({
                        ...settings,
                        timeSlots: settings.timeSlots.filter(
                          (x: string) => x !== t
                        ),
                      })
                    }
                    className="bg-red-500 px-3 py-1 rounded-xl font-bold"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            ملاحظة: أول باسورد افتراضي هو 1234، وبعد تغييره استخدم الباسورد الجديد.
          </p>
        </div>
      </div>
    </div>
  );
}
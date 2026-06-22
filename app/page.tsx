"use client";

import { useEffect, useState } from "react";
import {
  addBooking,
  getBookings,
  getSettings,
  getServices,
} from "@/lib/storage";

const paymentMethods = ["كاش", "فودافون كاش", "إنستاباي"];

const isMonday = (dateStr: string) => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDay() === 1;
};

const getNextAvailableDate = () => {
  const d = new Date();

  d.setHours(12, 0, 0, 0);

  d.setDate(d.getDate() + 1);

  while (d.getDay() === 1) {
    d.setDate(d.getDate() + 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const dateObj = new Date();
  dateObj.setHours(hour);
  dateObj.setMinutes(minute);

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Home() {
  const minBookingDate = getNextAvailableDate();
  
  console.log("today", new Date().toString());
console.log("minBookingDate", minBookingDate);

  const [tab, setTab] = useState<"book" | "track">("book");
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    maxPerDay: 20,
    bookingOpen: true,
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [servicesSelected, setServicesSelected] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState(minBookingDate);

  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  const loadBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  useEffect(() => {
    const load = async () => {
      const s = await getSettings();
      const servicesData = await getServices();

      setSettings(s);
      setServices(servicesData);
      await loadBookings();
    };

    load();
  }, []);

  const selectedDateBookings = bookings.filter(
    (b) => b.date === date && b.status !== "cancelled"
  );

  const isSelectedDateFull = selectedDateBookings.length >= settings.maxPerDay;

  const selectedTotal = servicesSelected.reduce((total, serviceName) => {
    const item = services.find((s) => s.name === serviceName);
    return total + Number(item?.price || 0);
  }, 0);

  const toggleService = (item: string) => {
    setServicesSelected((current) =>
      current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item]
    );
  };

 const handleBooking = async () => {
  if (loading) return;

  setMessage("");

  if (!settings.bookingOpen) {
    return setMessage("❌ الحجز مغلق حاليًا");
  }

if (
  !name ||
  !phone ||
  servicesSelected.length === 0 ||
  !date ||
  !paymentMethod
) {
  return setMessage(
    "❌ من فضلك املأ كل البيانات واختار خدمة وطريقة دفع"
  );
}
  if (date < minBookingDate) {
    return setMessage("❌ الحجز متاح من أقرب يوم عمل فقط");
  }

  if (isMonday(date)) {
    return setMessage("❌ يوم الاتنين إجازة، اختار يوم تاني");
  }

  if (isSelectedDateFull) {
    return setMessage("❌ لا يوجد مواعيد متاحة في هذا اليوم");
  }

  try {
    setLoading(true);

    const servicesText = servicesSelected
      .map((serviceName) => {
        const item = services.find((s) => s.name === serviceName);
        return `${serviceName} (${Number(item?.price || 0)} جنيه)`;
      })
      .join(" + ");

   const bookingData = {
  name,
  phone,
  service: `${servicesText} | الإجمالي: ${selectedTotal} جنيه | الدفع: ${paymentMethod}`,
  date,
  time: "",
};

    await addBooking(bookingData);

    await fetch("/api/send-notification", {
  method: "POST",
});

    await loadBookings();

   const allBookings = await getBookings();

const myBooking = allBookings
  .filter((b) => b.phone === phone)
  .sort((a, b) => (b.queue_number || 0) - (a.queue_number || 0))[0];

setMessage(
  `✅ تم الحجز بنجاح
رقم الدور: ${myBooking?.queue_number}
الحلاق رقم: ${myBooking?.barber_number}
الموعد المتوقع: ${myBooking?.estimated_time}`
);
    setName("");
    setPhone("");
    setServicesSelected([]);
    setPaymentMethod("");
    
  } catch {
    setMessage("❌ حصل خطأ أثناء الحجز");
  } finally {
    setLoading(false);
  }
};

  const handleTrack = async () => {
    setMessage("");

    const data = await getBookings();

    const booking = data
      .filter((b) => b.phone === trackPhone)
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    if (!booking) {
      setTrackResult(null);
      return setMessage("❌ لا يوجد حجز بهذا الرقم");
    }

    setTrackResult(booking);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#030812] text-white flex items-center justify-center p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#18283f_0%,#06111f_45%,#02040a_100%)]" />
      <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-[#b8860b]/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <img
            src="/logo.png"
            alt="Salon24 Logo"
            className="mx-auto w-40 h-40 object-cover rounded-[2rem] shadow-[0_25px_70px_rgba(212,175,55,0.25)] border border-[#d4af37]/25"
          />

          <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-[0.18em] bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent drop-shadow-lg">
            SALON 24
          </h1>

          <p className="mt-3 text-slate-300 text-lg tracking-wide">
            تجربة حجز فاخرة وسريعة بدون انتظار
          </p>

          {isSelectedDateFull || !settings.bookingOpen ? (
            <p className="mt-4 inline-block rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-red-300 font-bold">
              ❌ لا يوجد مواعيد متاحة في هذا اليوم
            </p>
          ) : (
            <p className="mt-4 inline-block rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-2 text-[#fff3b0] font-bold">
              🔥 متاح الحجز الآن
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            ملاحظة: يوم الاتنين إجازة
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#d4af37]/20 bg-white/[0.07] backdrop-blur-xl p-5 shadow-2xl shadow-black/40">
          <div className="grid grid-cols-2 gap-3 mb-5 rounded-2xl bg-black/35 p-2 border border-white/10">
            <button
              onClick={() => {
                setTab("book");
                setMessage("");
                setTrackResult(null);
              }}
              className={`p-3 rounded-xl font-black transition ${
                tab === "book"
                  ? "bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black"
                  : "bg-transparent text-slate-300"
              }`}
            >
              حجز
            </button>

            <button
              onClick={() => {
                setTab("track");
                setMessage("");
              }}
              className={`p-3 rounded-xl font-black transition ${
                tab === "track"
                  ? "bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black"
                  : "bg-transparent text-slate-300"
              }`}
            >
              متابعة الحجز
            </button>
          </div>

          {tab === "book" && (
            <div className="space-y-4">
              <input
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37]"
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37]"
                placeholder="رقم الموبايل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div>
                <p className="mb-2 text-sm text-slate-300 font-bold">
                  اختار الخدمات
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {services.length === 0 ? (
                    <p className="col-span-2 text-center text-slate-400 text-sm">
                      جاري تحميل الخدمات...
                    </p>
                  ) : (
                    services.map((s) => {
                      const selected = servicesSelected.includes(s.name);

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.name)}
                          className={`p-3 rounded-2xl border text-sm font-bold transition ${
                            selected
                              ? "border-[#d4af37] bg-[#d4af37]/20 text-[#fff3b0]"
                              : "border-white/10 bg-black/25 text-slate-300"
                          }`}
                        >
                          <span>{selected ? "✓ " : ""}{s.name}</span>
                          <br />
                          <span className="text-xs text-[#fff3b0]">
                            {Number(s.price || 0)} جنيه
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {servicesSelected.length > 0 && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4">
                  <p className="text-sm text-slate-300">المختار:</p>
                  <p className="text-[#fff3b0] text-sm font-bold mt-1">
                    {servicesSelected.join(" + ")}
                  </p>
                  <p className="text-2xl font-black text-[#fff3b0] mt-3">
                    الإجمالي: {selectedTotal} جنيه
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm text-slate-300 font-bold">
                  طريقة الدفع
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-2xl border text-sm font-bold transition ${
                        paymentMethod === method
                          ? "border-[#d4af37] bg-[#d4af37]/20 text-[#fff3b0]"
                          : "border-white/10 bg-black/25 text-slate-300"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="date"
                min={minBookingDate}
                value={date}
                onChange={(e) => {
                  const selected = e.target.value;

                  if (isMonday(selected)) {
                    setMessage("❌ يوم الاتنين إجازة، اختار يوم تاني");
                    setDate(minBookingDate);
                  
                    return;
                  }

                  setDate(selected);
                
                  setMessage("");
                }}
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37]"
              />

            

              <button
                onClick={handleBooking}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black font-black shadow-xl disabled:opacity-50"
                disabled={
                  isSelectedDateFull ||
                  !settings.bookingOpen ||
                  loading ||
                  isMonday(date)
                }
              >
                {loading ? "جاري الحجز..." : "تأكيد الحجز"}
              </button>
            </div>
          )}

          {tab === "track" && (
            <div className="space-y-4">
              <input
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37]"
                placeholder="اكتب رقم الموبايل"
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value)}
              />

              <button
                onClick={handleTrack}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black font-black"
              >
                عرض الحجز
              </button>

              {trackResult && (
                <div className="bg-black/35 border border-white/10 rounded-3xl p-5 text-center space-y-2">
                  <p
                    className={`text-xl font-black ${
                      trackResult.status === "completed"
                        ? "text-green-400"
                        : trackResult.status === "cancelled"
                        ? "text-red-400"
                        : "text-blue-400"
                    }`}
                  >
                    {trackResult.status === "completed"
                      ? "✅ تم اكتمال حجزك"
                      : trackResult.status === "cancelled"
                      ? "❌ تم إلغاء حجزك"
                      : "⏳ حجزك منتظر"}
                  </p>

                  <p>الاسم: {trackResult.name}</p>
                  <p>الخدمات: {trackResult.service}</p>
                  <p>اليوم: {trackResult.date}</p>
                  <p>رقم الدور: {trackResult.queue_number}</p>

<p>الحلاق رقم: {trackResult.barber_number}</p>

<p>
الموعد المتوقع:
{trackResult.estimated_time}
</p>
                </div>
              )}
            </div>
          )}

          {message && (
            <p className="text-center font-bold mt-5 rounded-2xl bg-black/35 border border-white/10 p-3">
              {message}
            </p>
          )}
                </div>

        <footer className="text-center text-xs text-slate-500 py-10 leading-7 mt-8">
          © 2026 Salon24. جميع الحقوق محفوظة.

          <div className="mt-2">
            تم تطوير النظام بواسطة
          </div>

          <div className="text-[#d4af37] font-bold">
            Eng: Abdo Hesham
          </div>

          <div className="text-[#d4af37] font-bold">
            Eng: Eslam Said
          </div>
        </footer>
      </div>
    </div>
  );
}
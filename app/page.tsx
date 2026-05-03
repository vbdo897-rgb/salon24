"use client";

import { useEffect, useState } from "react";
import { addBooking, getBookings, getSettings, isSlotBooked } from "@/lib/storage";

const services = [
  "قص",
  "دقن ماكينة",
  "دقن بالبخار",
  "استشوار",
  "تنضيف بشرة كامل",
  "صنفرة",
  "صنفرة بخار",
  "واكس",
  "صبغة",
];

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
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
  const tomorrow = getTomorrow();

  const [tab, setTab] = useState<"book" | "track">("book");
  const [settings, setSettings] = useState({
    maxPerDay: 20,
    bookingOpen: true,
    timeSlots: [] as string[],
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [servicesSelected, setServicesSelected] = useState<string[]>([]);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("");

  const [lastBooking, setLastBooking] = useState<any>(null);
  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  const loadBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  useEffect(() => {
    setSettings(getSettings());
    loadBookings();
  }, []);

  const selectedDateBookings = bookings.filter(
    (b) => b.date === date && b.status !== "cancelled"
  );

  const isSelectedDateFull = selectedDateBookings.length >= settings.maxPerDay;

  const toggleService = (item: string) => {
    setServicesSelected((current) =>
      current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item]
    );
  };

  const handleBooking = async () => {
    setMessage("");
    setLastBooking(null);

    if (!settings.bookingOpen) return setMessage("❌ الحجز مغلق حاليًا");

    if (!name || !phone || servicesSelected.length === 0 || !date || !time) {
      return setMessage("❌ من فضلك املأ كل البيانات واختار خدمة واحدة على الأقل");
    }

    if (date < tomorrow) {
      return setMessage("❌ الحجز متاح من بكرة فقط");
    }

    if (isSelectedDateFull)
      return setMessage("❌ لا يوجد مواعيد متاحة في هذا اليوم");

    const booked = await isSlotBooked(date, time);
    if (booked) return setMessage("❌ المعاد ده محجوز، اختار معاد تاني");

    const bookingData = {
      name,
      phone,
      service: servicesSelected.join(" + "),
      date,
      time,
    };

    try {
      setLoading(true);
      await addBooking(bookingData);
      await loadBookings();

      setLastBooking(bookingData);
      setMessage(`✅ تم الحجز بنجاح - معادك ${formatTime(time)}`);
      setName("");
      setPhone("");
      setServicesSelected([]);
      setTime("");
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

  const whatsappLink = lastBooking
    ? `https://wa.me/2${lastBooking.phone}?text=${encodeURIComponent(
        `تم تأكيد حجزك في Salon24\nالاسم: ${lastBooking.name}\nالخدمات: ${
          lastBooking.service
        }\nاليوم: ${lastBooking.date}\nالساعة: ${formatTime(lastBooking.time)}`
      )}`
    : "";

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
            🔥 متاح الحجز الآن            </p>
          )}
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
                  ? "bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black shadow-lg shadow-yellow-500/20"
                  : "bg-transparent text-slate-300"
              }`}
            >
              حجز
            </button>

            <button
              onClick={() => {
                setTab("track");
                setMessage("");
                setLastBooking(null);
              }}
              className={`p-3 rounded-xl font-black transition ${
                tab === "track"
                  ? "bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black shadow-lg shadow-yellow-500/20"
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
                  {services.map((s) => {
                    const selected = servicesSelected.includes(s);

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        className={`p-3 rounded-2xl border text-sm font-bold transition ${
                          selected
                            ? "border-[#d4af37] bg-[#d4af37]/20 text-[#fff3b0] shadow-[0_0_18px_rgba(212,175,55,0.18)]"
                            : "border-white/10 bg-black/25 text-slate-300"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {s}
                      </button>
                    );
                  })}
                </div>

                {servicesSelected.length > 0 && (
                  <p className="mt-2 text-xs text-[#fff3b0]">
                    المختار: {servicesSelected.join(" + ")}
                  </p>
                )}
              </div>

              <input
                type="date"
                min={tomorrow}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                  setMessage("");
                  setLastBooking(null);
                }}
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37]"
              />

              <select
                className="w-full p-4 rounded-2xl bg-black/35 border border-white/10 outline-none focus:border-[#d4af37] disabled:opacity-50"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isSelectedDateFull || !settings.bookingOpen}
              >
                <option value="">اختار المعاد</option>

                {settings.timeSlots.map((slot) => {
                  const booked = bookings.some(
                    (b) =>
                      b.date === date &&
                      b.time === slot &&
                      b.status !== "cancelled"
                  );

                  return (
                    <option key={slot} value={slot} disabled={booked}>
                      {booked
                        ? `${formatTime(slot)} - محجوز`
                        : formatTime(slot)}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleBooking}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black font-black shadow-xl shadow-yellow-500/20 disabled:opacity-50"
                disabled={isSelectedDateFull || !settings.bookingOpen || loading}
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
                  <p>المعاد: {formatTime(trackResult.time)}</p>
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
      </div>
    </div>
  );
}
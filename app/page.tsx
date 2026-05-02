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
  const today = new Date().toISOString().split("T")[0];

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
  const [service, setService] = useState("قص");
  const [date, setDate] = useState(today);
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

  const handleBooking = async () => {
    setMessage("");
    setLastBooking(null);

    if (!settings.bookingOpen) return setMessage("❌ الحجز مغلق حاليًا");
    if (!name || !phone || !service || !date || !time)
      return setMessage("❌ من فضلك املأ كل البيانات");

    if (isSelectedDateFull)
      return setMessage("❌ لا يوجد مواعيد متاحة في هذا اليوم");

    const booked = await isSlotBooked(date, time);

    if (booked) return setMessage("❌ المعاد ده محجوز، اختار معاد تاني");

    const bookingData = {
      name,
      phone,
      service,
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
        `تم تأكيد حجزك في Salon24\nالاسم: ${lastBooking.name}\nالخدمة: ${
          lastBooking.service
        }\nاليوم: ${lastBooking.date}\nالساعة: ${formatTime(lastBooking.time)}`
      )}`
    : "";

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-5">
        <h1 className="text-4xl font-bold text-center mb-2">Salon24</h1>

        {isSelectedDateFull || !settings.bookingOpen ? (
          <p className="text-center text-red-400 font-bold mb-2">
            ❌ لا يوجد مواعيد متاحة اليوم
          </p>
        ) : (
          <p className="text-center text-green-400 font-bold mb-2">
            🔥 متاح الحجز الآن
          </p>
        )}

        <p className="text-center text-slate-400 mb-6">احجز ميعادك بسهولة</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => {
              setTab("book");
              setMessage("");
              setTrackResult(null);
            }}
            className={`p-3 rounded-xl font-bold ${
              tab === "book" ? "bg-yellow-500 text-black" : "bg-slate-800"
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
            className={`p-3 rounded-xl font-bold ${
              tab === "track" ? "bg-yellow-500 text-black" : "bg-slate-800"
            }`}
          >
            متابعة الحجز
          </button>
        </div>

        {tab === "book" && (
          <div className="space-y-4">
            <input
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
              placeholder="رقم الموبايل"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <select
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
                setMessage("");
                setLastBooking(null);
              }}
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
            />

            <select
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
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
              className="w-full p-3 rounded-xl bg-yellow-500 text-black font-bold disabled:opacity-50"
              disabled={isSelectedDateFull || !settings.bookingOpen || loading}
            >
              {loading ? "جاري الحجز..." : "تأكيد الحجز"}
            </button>

            {lastBooking && (
              <a
                href={whatsappLink}
                target="_blank"
                className="block text-center w-full p-3 rounded-xl bg-green-500 text-black font-bold"
              >
                إرسال الحجز على واتساب
              </a>
            )}
          </div>
        )}

        {tab === "track" && (
          <div className="space-y-4">
            <input
              className="w-full p-3 rounded-xl bg-slate-800 outline-none"
              placeholder="اكتب رقم الموبايل"
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value)}
            />

            <button
              onClick={handleTrack}
              className="w-full p-3 rounded-xl bg-yellow-500 text-black font-bold"
            >
              عرض الحجز
            </button>

            {trackResult && (
              <div className="bg-slate-800 rounded-2xl p-4 text-center space-y-2">
                <p
                  className={`text-xl font-bold ${
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
                <p>الخدمة: {trackResult.service}</p>
                <p>اليوم: {trackResult.date}</p>
                <p>المعاد: {formatTime(trackResult.time)}</p>
              </div>
            )}
          </div>
        )}

        {message && <p className="text-center font-bold mt-4">{message}</p>}
      </div>
    </div>
  );
}
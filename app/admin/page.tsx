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

export default function Admin() {
  const today = new Date().toISOString().split("T")[0];

  const [logged, setLogged] = useState(false);
  const [code, setCode] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [newTime, setNewTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  const loadBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  useEffect(() => {
    setSettings(getSettings());
    loadBookings();
  }, []);

  const login = () => {
    if (code === "1234") setLogged(true);
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

  const todayBookings = bookings
    .filter((b) => b.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const activeTodayBookings = todayBookings.filter(
    (b) => b.status !== "cancelled"
  );

  const selectedDateBookings = bookings
    .filter((b) => b.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const renderBookingCard = (b: any) => (
    <div
      key={b.id}
      className="bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
    >
      <div>
        <p className="text-xl font-bold">{b.name}</p>
        <p className="text-slate-300">📞 {b.phone}</p>
        <p className="text-slate-300">الخدمة: {b.service}</p>
        <p className="text-yellow-400 font-bold">
          {b.date} - {formatTime(b.time)}
        </p>

        <p
          className={`font-bold ${
            b.status === "completed"
              ? "text-green-400"
              : b.status === "cancelled"
              ? "text-red-400"
              : "text-blue-400"
          }`}
        >
          {b.status === "completed"
            ? "تم"
            : b.status === "cancelled"
            ? "ملغي"
            : "منتظر"}
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
            إرجاع منتظر
          </button>
        )}
      </div>
    </div>
  );

  if (!logged) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4"
      >
        <div className="w-full max-w-sm bg-slate-900 p-5 rounded-3xl space-y-4">
          <h1 className="text-3xl font-bold text-center">Salon24 Admin</h1>

          <input
            type="password"
            placeholder="كود الأدمن"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 bg-slate-800 rounded-xl outline-none"
          />

          <button
            onClick={login}
            className="w-full bg-yellow-500 text-black p-3 rounded-xl font-bold"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-3xl font-bold">لوحة تحكم Salon24</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 p-4 rounded-2xl">
            <p className="text-slate-400">حجوزات اليوم</p>
            <p className="text-3xl font-bold">{activeTodayBookings.length}</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl">
            <p className="text-slate-400">الحد اليومي</p>
            <p className="text-3xl font-bold">{settings.maxPerDay}</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl">
            <p className="text-slate-400">المتبقي اليوم</p>
            <p className="text-3xl font-bold">
              {settings.maxPerDay - activeTodayBookings.length}
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl">
            <p className="text-slate-400">حالة الحجز</p>
            <p className="text-xl font-bold">
              {settings.bookingOpen ? "مفتوح" : "مغلق"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">حجوزات اليوم</h2>

            <button
              onClick={refreshBookings}
              className="bg-slate-700 px-4 py-2 rounded-xl"
            >
              تحديث
            </button>
          </div>

          {todayBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-6">
              لا توجد حجوزات اليوم
            </p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(renderBookingCard)}
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold">عرض حجوزات تاريخ معين</h2>
              <p className="text-slate-400 text-sm mt-1">
                اختار تاريخ لعرض حجوزاته فقط
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 p-3 rounded-xl outline-none"
            />
          </div>

          {selectedDateBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-6">
              لا توجد حجوزات في هذا التاريخ
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedDateBookings.map(renderBookingCard)}
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl space-y-4">
          <h2 className="text-2xl font-bold">إعدادات الحجز</h2>

          <input
            type="number"
            value={settings.maxPerDay}
            onChange={(e) =>
              updateSettings({
                ...settings,
                maxPerDay: Number(e.target.value),
              })
            }
            className="p-3 bg-slate-800 w-full rounded-xl outline-none"
            placeholder="عدد الحجوزات اليومي"
          />

          <button
            onClick={() =>
              updateSettings({
                ...settings,
                bookingOpen: !settings.bookingOpen,
              })
            }
            className={`p-3 w-full rounded-xl font-bold ${
              settings.bookingOpen
                ? "bg-green-500 text-black"
                : "bg-red-500 text-white"
            }`}
          >
            {settings.bookingOpen ? "الحجز مفتوح" : "الحجز مغلق"}
          </button>

          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="p-3 bg-slate-800 flex-1 rounded-xl outline-none"
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
              className="bg-yellow-500 text-black px-4 rounded-xl font-bold"
            >
              إضافة
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {settings.timeSlots.map((t: string) => (
              <div
                key={t}
                className="flex justify-between items-center bg-slate-800 p-3 rounded-xl"
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
                  className="bg-red-500 px-2 py-1 rounded-lg"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
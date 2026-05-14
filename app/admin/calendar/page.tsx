"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { getBookings } from "@/lib/storage";

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  const d = new Date();
  d.setHours(hour);
  d.setMinutes(minute);

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      const data = await getBookings();
      setBookings(data);
    };

    load();
  }, []);

  const selectedDateString = selectedDate.toISOString().split("T")[0];

  const dayBookings = bookings.filter(
    (b) => b.date === selectedDateString
  );

  const getDayBookingsCount = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];

    return bookings.filter((b) => b.date === dateString).length;
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-7xl mx-auto space-y-5">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
              تقويم الحجوزات
            </h1>

            <p className="text-slate-400 mt-2">
              عرض المواعيد والحجوزات بشكل احترافي
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/admin"
              className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
            >
              الأدمن
            </a>

            <a
              href="/admin/reports"
              className="bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black px-5 py-3 rounded-2xl font-black"
            >
              التقارير
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[420px,1fr] gap-5">

          <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5 backdrop-blur-xl overflow-hidden">

            <Calendar
              onChange={(value: any) => setSelectedDate(value)}
              value={selectedDate}
              locale="en-US"

              tileContent={({ date, view }) => {
                if (view !== "month") return null;

                const count = getDayBookingsCount(date);

                if (!count) return null;

                return (
                  <div className="flex justify-center mt-1">
                    <span
                      className={`text-[10px] px-2 py-[2px] rounded-full font-bold ${
                        count >= 15
                          ? "bg-red-500 text-white"
                          : count >= 8
                          ? "bg-yellow-500 text-black"
                          : "bg-green-500 text-black"
                      }`}
                    >
                      {count} حجز
                    </span>
                  </div>
                );
              }}
            />

          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5 backdrop-blur-xl">

            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-3xl font-black text-[#fff3b0]">
                  حجوزات {selectedDateString}
                </h2>

                <p className="text-slate-400 mt-1">
                  عدد الحجوزات: {dayBookings.length}
                </p>
              </div>
            </div>

            {dayBookings.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 text-xl font-bold">
                لا توجد حجوزات في هذا اليوم
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">

                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-3xl border border-[#d4af37]/15 bg-black/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">

                      <div>
                        <p className="text-2xl font-black">
                          {b.name}
                        </p>

                        <p className="text-slate-400 mt-1">
                          📞 {b.phone}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-black ${
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

                    <div className="mt-4 space-y-2">
                      <p className="text-[#fff3b0] font-bold">
                        ⏰ {formatTime(b.time)}
                      </p>

                      <p className="text-slate-300">
                        {b.service}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
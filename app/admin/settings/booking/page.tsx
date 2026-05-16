"use client";

import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage";

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

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getSettings();
      setSettings(data);
    };

    load();
  }, []);

  const updateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  if (!settings) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-[#fff3b0]">
              المواعيد والحجز
            </h1>
            <p className="text-slate-400 mt-2">
              فتح وقفل الحجز وإدارة المواعيد
            </p>
          </div>

          <a href="/admin" className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black">
            رجوع
          </a>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <p className="text-slate-300 mb-2 font-bold">عدد الزباين يوميًا</p>

          <input
            type="number"
            value={settings.maxPerDay}
            onChange={(e) =>
              updateSettings({
                ...settings,
                maxPerDay: Number(e.target.value),
              })
            }
            className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl outline-none focus:border-[#d4af37]"
          />
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

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <p className="text-slate-300 mb-2 font-bold">إضافة معاد جديد</p>

          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="p-4 bg-black/35 border border-white/10 flex-1 rounded-2xl outline-none focus:border-[#d4af37]"
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
              className="bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black px-5 rounded-2xl font-black"
            >
              إضافة
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
            المواعيد الحالية
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {settings.timeSlots.map((t: string) => (
              <div key={t} className="flex justify-between items-center bg-black/35 border border-white/10 p-3 rounded-2xl">
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
      </div>
    </div>
  );
}
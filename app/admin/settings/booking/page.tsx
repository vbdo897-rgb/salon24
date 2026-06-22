"use client";

import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage";

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState<any>(null);

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
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#fff3b0]">
              إعدادات الحجز
            </h1>

            <p className="text-slate-400 mt-2">
              التحكم الكامل في نظام الأدوار
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
          >
            رجوع
          </a>
        </div>

        {/* فتح وغلق الحجز */}

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

        {/* الحد الأقصى */}

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <label className="font-bold block mb-2">
            الحد الأقصى للعملاء يوميًا
          </label>

          <input
            type="number"
            value={settings.maxPerDay}
            onChange={(e) =>
              updateSettings({
                ...settings,
                maxPerDay: Number(e.target.value),
              })
            }
            className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl"
          />
        </div>

        {/* عدد الحلاقين */}

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <label className="font-bold block mb-2">
            عدد الحلاقين
          </label>

          <input
            type="number"
            value={settings.barbersCount}
            onChange={(e) =>
              updateSettings({
                ...settings,
                barbersCount: Number(e.target.value),
              })
            }
            className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl"
          />
        </div>

        {/* مدة الخدمة */}

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <label className="font-bold block mb-2">
            مدة الخدمة بالدقائق
          </label>

          <input
            type="number"
            value={settings.queueDuration}
            onChange={(e) =>
              updateSettings({
                ...settings,
                queueDuration: Number(e.target.value),
              })
            }
            className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl"
          />
        </div>

        {/* بداية ونهاية العمل */}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
            <label className="font-bold block mb-2">
              بداية العمل
            </label>

            <input
              type="time"
              value={settings.workStart}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  workStart: e.target.value,
                })
              }
              className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl"
            />
          </div>

          <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
            <label className="font-bold block mb-2">
              نهاية العمل
            </label>

            <input
              type="time"
              value={settings.workEnd}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  workEnd: e.target.value,
                })
              }
              className="p-4 bg-black/35 border border-white/10 w-full rounded-2xl"
            />
          </div>
        </div>

        {/* ملخص */}

        <div className="rounded-3xl border border-[#d4af37]/15 bg-[#d4af37]/10 p-5">
          <h3 className="font-black text-[#fff3b0] mb-3">
            ملخص التشغيل
          </h3>

          <div className="space-y-2 text-slate-200">
            <p>عدد الحلاقين: {settings.barbersCount}</p>

            <p>مدة العميل: {settings.queueDuration} دقيقة</p>

            <p>
              ساعات العمل: {settings.workStart} → {settings.workEnd}
            </p>

            <p>الحد الأقصى: {settings.maxPerDay} عميل يوميًا</p>
          </div>
        </div>
      </div>
    </div>
  );
}
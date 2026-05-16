"use client";

import { useState } from "react";
import {
  deleteBookingsByDate,
  deleteOldBookings,
} from "@/lib/storage";

export default function BookingsSettingsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");

  const handleClearSelectedDay = async () => {
    if (!selectedDate) {
      alert("اختار تاريخ الأول");
      return;
    }

    const ok = confirm(`متأكد إنك عايز تحذف كل حجوزات يوم ${selectedDate}؟`);
    if (!ok) return;

    try {
      await deleteBookingsByDate(selectedDate);
      alert("✅ تم تفريغ اليوم المحدد");
    } catch {
      alert("❌ حصل خطأ أثناء تفريغ اليوم");
    }
  };

  const handleDeleteOldBookings = async () => {
    const ok = confirm("متأكد إنك عايز تحذف كل الحجوزات القديمة؟");
    if (!ok) return;

    try {
      await deleteOldBookings(today);
      alert("✅ تم حذف الحجوزات القديمة");
    } catch {
      alert("❌ حصل خطأ أثناء حذف الحجوزات القديمة");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-[#fff3b0]">
              إدارة الحجوزات
            </h1>
            <p className="text-slate-400 mt-2">
              حذف الحجوزات القديمة أو تفريغ يوم محدد
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
          >
            رجوع
          </a>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-5 space-y-3">
          <h2 className="text-2xl font-black text-red-300">
            تفريغ يوم كامل
          </h2>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-400"
          />

          <button
            onClick={handleClearSelectedDay}
            className="w-full bg-red-600 text-white p-4 rounded-2xl font-black"
          >
            تفريغ التاريخ المحدد
          </button>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-black/35 p-5 space-y-3">
          <h2 className="text-2xl font-black text-red-300">
            حذف الحجوزات القديمة
          </h2>

          <p className="text-slate-400">
            سيتم حذف كل الحجوزات قبل تاريخ اليوم: {today}
          </p>

          <button
            onClick={handleDeleteOldBookings}
            className="w-full bg-black border border-red-500 text-red-400 p-4 rounded-2xl font-black"
          >
            حذف الحجوزات القديمة
          </button>
        </div>
      </div>
    </div>
  );
}
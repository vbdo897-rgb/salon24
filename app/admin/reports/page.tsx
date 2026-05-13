"use client";

import { useEffect, useState } from "react";
import { getBookings } from "@/lib/storage";

export default function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getBookings();
      setBookings(data);
    };

    load();
  }, []);

  const getBookingTotal = (serviceText: string) => {
    const match = serviceText?.match(/الإجمالي:\s*(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  );

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

  const cancelledToday = bookings.filter(
    (b) => b.date === today && b.status === "cancelled"
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

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-7xl mx-auto space-y-5">

        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
            التقارير والإحصائيات
          </h1>

          <p className="text-slate-400 mt-2">
            Dashboard خاصة بالأرباح والحجوزات
          </p>

          <a
  href="/admin"
  className="inline-block mt-4 bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
>
  رجوع للأدمن
</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-6 rounded-3xl backdrop-blur-xl">
            <p className="text-slate-300">أرباح اليوم</p>

            <p className="text-4xl font-black mt-3 text-[#fff3b0]">
              {todayRevenue} ج
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-6 rounded-3xl backdrop-blur-xl">
            <p className="text-slate-300">أرباح الشهر</p>

            <p className="text-4xl font-black mt-3 text-[#fff3b0]">
              {monthRevenue} ج
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-6 rounded-3xl backdrop-blur-xl">
            <p className="text-slate-300">إلغاءات اليوم</p>

            <p className="text-4xl font-black mt-3 text-red-300">
              {cancelledToday}
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-6 rounded-3xl backdrop-blur-xl">
            <p className="text-slate-300">الأكثر طلبًا</p>

            <p className="text-2xl font-black mt-4 text-[#fff3b0]">
              {topServiceName}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
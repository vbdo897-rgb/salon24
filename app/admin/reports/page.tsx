"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookings } from "@/lib/storage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const getToday = () => new Date().toISOString().split("T")[0];
const getMonth = () => getToday().slice(0, 7);

export default function ReportsPage() {
  const today = getToday();
  const currentMonth = getMonth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(currentMonth + "-01");
  const [toDate, setToDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

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

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date >= fromDate && b.date <= toDate)
      .filter((b) =>
        statusFilter === "all" ? true : b.status === statusFilter
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, fromDate, toDate, statusFilter]);

  const completedBookings = filteredBookings.filter(
    (b) => b.status === "completed"
  );

  const waitingBookings = filteredBookings.filter(
    (b) => b.status === "waiting"
  );

  const cancelledBookings = filteredBookings.filter(
    (b) => b.status === "cancelled"
  );

  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + getBookingTotal(b.service),
    0
  );

  const averageRevenue =
    completedBookings.length > 0
      ? Math.round(totalRevenue / completedBookings.length)
      : 0;

  const serviceStats = (() => {
    const counts: any = {};
    const revenue: any = {};

    filteredBookings.forEach((b) => {
      if (!b.service) return;

      const beforeTotal = b.service.split("|")[0];
      const items = beforeTotal.split(" + ");

      items.forEach((item: string) => {
        const cleanName = item.replace(/\(.*?\)/g, "").trim();
        const priceMatch = item.match(/\((\d+)/);
        const price = priceMatch ? Number(priceMatch[1]) : 0;

        if (!cleanName) return;

        counts[cleanName] = (counts[cleanName] || 0) + 1;
        revenue[cleanName] = (revenue[cleanName] || 0) + price;
      });
    });

    return Object.keys(counts)
      .map((name) => ({
        name,
        count: counts[name],
        revenue: revenue[name],
      }))
      .sort((a, b) => b.count - a.count);
  })();

  const topService = serviceStats[0]?.name || "لا يوجد";

  const dailyStats = (() => {
    const map: any = {};

    filteredBookings.forEach((b) => {
      if (!map[b.date]) {
        map[b.date] = {
          date: b.date,
          count: 0,
          revenue: 0,
        };
      }

      map[b.date].count += 1;

      if (b.status === "completed") {
        map[b.date].revenue += getBookingTotal(b.service);
      }
    });

    return Object.values(map).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );
  })() as any[];

  const statusData = [
    { name: "مكتملة", value: completedBookings.length },
    { name: "منتظرة", value: waitingBookings.length },
    { name: "ملغية", value: cancelledBookings.length },
  ];

  const statusColors = ["#4ade80", "#60a5fa", "#f87171"];

const exportPDF = () => {
  window.print();
};

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div id="reports-content" className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
              التقارير والإحصائيات
            </h1>

            <p className="text-slate-400 mt-2">
              ملخص كامل للأرباح والحجوزات والخدمات
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black px-5 py-3 rounded-2xl font-black disabled:opacity-50"
            >
              {exporting ? "جاري التحميل..." : "تحميل PDF"}
            </button>

            <a
              href="/admin"
              className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black text-center"
            >
              رجوع للأدمن
            </a>
          </div>
        </div>

        <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5 grid md:grid-cols-3 gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
          >
            <option value="all">كل الحالات</option>
            <option value="waiting">منتظر</option>
            <option value="completed">تم</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">إجمالي الأرباح</p>
            <p className="text-3xl font-black mt-2 text-[#fff3b0]">
              {totalRevenue} ج
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">عدد الحجوزات</p>
            <p className="text-4xl font-black mt-2">
              {filteredBookings.length}
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">المكتملة</p>
            <p className="text-4xl font-black mt-2 text-green-300">
              {completedBookings.length}
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">المنتظرة</p>
            <p className="text-4xl font-black mt-2 text-blue-300">
              {waitingBookings.length}
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">الملغية</p>
            <p className="text-4xl font-black mt-2 text-red-300">
              {cancelledBookings.length}
            </p>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 p-5 rounded-3xl">
            <p className="text-slate-300">متوسط الحجز</p>
            <p className="text-3xl font-black mt-2 text-[#fff3b0]">
              {averageRevenue} ج
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5">
            <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
              رسم أرباح الأيام
            </h2>

            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <XAxis dataKey="date" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      background: "#07111f",
                      border: "1px solid rgba(212,175,55,.25)",
                      borderRadius: "16px",
                      color: "white",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#d4af37"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5">
            <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
              حالة الحجوزات
            </h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={statusColors[index]} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#07111f",
                      border: "1px solid rgba(212,175,55,.25)",
                      borderRadius: "16px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-black/35 border border-white/10 p-4 mt-5">
              <p className="text-slate-300">الأكثر طلبًا</p>
              <p className="text-2xl font-black text-[#fff3b0] mt-2">
                {topService}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5">
            <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
              ترتيب الخدمات
            </h2>

            <div className="h-[330px] mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceStats.slice(0, 8)}>
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      background: "#07111f",
                      border: "1px solid rgba(212,175,55,.25)",
                      borderRadius: "16px",
                      color: "white",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#fff3b0"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {serviceStats.length === 0 ? (
                <p className="text-slate-400 text-center py-10">
                  لا توجد خدمات
                </p>
              ) : (
                serviceStats.map((s) => (
                  <div
                    key={s.name}
                    className="bg-black/35 border border-white/10 rounded-2xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-black">{s.name}</p>
                      <p className="text-slate-400 text-sm">
                        عدد الطلبات: {s.count}
                      </p>
                    </div>

                    <p className="text-[#fff3b0] font-black">{s.revenue} ج</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5">
            <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
              آخر الحجوزات
            </h2>

            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredBookings.length === 0 ? (
                <p className="text-slate-400 text-center py-10">
                  لا توجد حجوزات
                </p>
              ) : (
                filteredBookings.slice(0, 14).map((b) => (
                  <div
                    key={b.id}
                    className="bg-black/35 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-black">{b.name}</p>
                        <p className="text-slate-400 text-sm">{b.phone}</p>
                      </div>

                      <span
                        className={`h-fit px-3 py-1 rounded-full text-xs font-bold ${
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

                    <p className="text-[#fff3b0] text-sm mt-3">
                      {b.date} - {formatTime(b.time)}
                    </p>

                    <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                      {b.service}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
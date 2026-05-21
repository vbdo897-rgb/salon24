"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  deleteBooking,
  getBookings,
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

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = async () => {
    const data = await getBookings();
    const found = data.find((b: any) => String(b.id) === String(id));

    setBooking(found || null);
    setLoading(false);
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const changeStatus = async (
    status: "waiting" | "completed" | "cancelled"
  ) => {
    await updateBookingStatus(id, status);
    await loadBooking();
    alert("✅ تم تحديث حالة الحجز");
  };

  const handleDelete = async () => {
    const ok = confirm("متأكد إنك عايز تحذف الحجز نهائيًا؟");
    if (!ok) return;

    await deleteBooking(id);
    alert("✅ تم حذف الحجز");

    window.location.href = "/admin";
  };

  if (loading) return null;

  if (!booking) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#02040a] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-red-400">الحجز غير موجود</h1>
          <a href="/admin" className="block mt-5 text-[#fff3b0] underline">
            رجوع للأدمن
          </a>
        </div>
      </div>
    );
  }

  const totalMatch = booking.service?.match(/الإجمالي:\s*(\d+)/);
  const total = totalMatch ? totalMatch[1] : "0";

  const paymentMatch = booking.service?.match(/الدفع:\s*([^|]+)/);
  const payment = paymentMatch ? paymentMatch[1].trim() : "غير محدد";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-[#fff3b0]">
              تفاصيل الحجز
            </h1>
            <p className="text-slate-400 mt-2">
              عرض بيانات العميل والتحكم في حالة الحجز
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
          >
            رجوع
          </a>
        </div>

        <div className="rounded-[2rem] border border-[#d4af37]/15 bg-white/[0.07] p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Info title="اسم العميل" value={booking.name} />
            <Info title="رقم الموبايل" value={booking.phone} />
            <Info title="التاريخ" value={booking.date} />
            <Info title="المعاد" value={formatTime(booking.time)} />
            <Info title="الإجمالي" value={`${total} جنيه`} />
            <Info title="طريقة الدفع" value={payment} />
          </div>

          <div className="rounded-3xl bg-black/35 border border-white/10 p-4">
            <p className="text-slate-400 mb-2">الخدمات</p>
            <p className="text-[#fff3b0] font-bold leading-8">
              {booking.service}
            </p>
          </div>

          <div className="rounded-3xl bg-black/35 border border-white/10 p-4">
            <p className="text-slate-400 mb-2">حالة الحجز</p>
            <p
              className={`text-2xl font-black ${
                booking.status === "completed"
                  ? "text-green-300"
                  : booking.status === "cancelled"
                  ? "text-red-300"
                  : "text-blue-300"
              }`}
            >
              {booking.status === "completed"
                ? "تم"
                : booking.status === "cancelled"
                ? "ملغي"
                : "منتظر"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${booking.phone}`}
              className="bg-green-500 text-black px-5 py-3 rounded-2xl font-black"
            >
              اتصال
            </a>

            <a
              href={`https://wa.me/2${booking.phone}?text=${encodeURIComponent(
                `أهلاً ${booking.name}، معاك Salon24 بخصوص حجزك الساعة ${formatTime(
                  booking.time
                )}`
              )}`}
              target="_blank"
              className="bg-emerald-500 text-black px-5 py-3 rounded-2xl font-black"
            >
              واتساب
            </a>

            <button
              onClick={() => changeStatus("completed")}
              className="bg-blue-500 text-white px-5 py-3 rounded-2xl font-black"
            >
              تم
            </button>

            <button
              onClick={() => changeStatus("cancelled")}
              className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black"
            >
              إلغاء
            </button>

            <button
              onClick={() => changeStatus("waiting")}
              className="bg-slate-600 text-white px-5 py-3 rounded-2xl font-black"
            >
              إرجاع منتظر
            </button>

            <button
              onClick={handleDelete}
              className="bg-black border border-red-500 text-red-400 px-5 py-3 rounded-2xl font-black"
            >
              حذف نهائي
            </button>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-500 py-6 leading-7">
          © 2026 Salon24. جميع الحقوق محفوظة.
          <div className="mt-2">تم تطوير النظام بواسطة</div>
          <div className="text-[#d4af37] font-bold">Eng: Abdo Hesham</div>
          <div className="text-[#d4af37] font-bold">Eng: Eslam Said</div>
        </footer>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-3xl bg-black/35 border border-white/10 p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-xl font-black mt-2">{value}</p>
    </div>
  );
}
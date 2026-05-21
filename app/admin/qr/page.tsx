"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function QRPage() {
  const bookingUrl = "https://salon24-beryl.vercel.app";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4 flex items-center justify-center print:p-0 print:bg-[#07111f]"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #07111f !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="w-full max-w-[360px] md:max-w-lg rounded-[2rem] border border-[#d4af37]/20 bg-white/[0.07] backdrop-blur-xl p-6 text-center shadow-2xl print:min-h-screen print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none print:bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] print:flex print:flex-col print:items-center print:justify-center">
        <img
          src="/logo.png"
          alt="Salon24"
          className="mx-auto w-28 h-28 object-cover rounded-3xl border border-[#d4af37]/30 mb-4"
        />

        <h1 className="text-5xl font-black tracking-[0.15em] bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
          SALON 24
        </h1>

        <p className="mt-3 text-xl font-black text-[#fff3b0]">
          امسح الكود واحجز ميعادك
        </p>

        <p className="text-slate-400 mt-1">
          Scan to book your appointment
        </p>

        <div className="my-8 bg-white p-6 rounded-[2rem] inline-block border-4 border-[#d4af37] shadow-[0_20px_80px_rgba(212,175,55,0.25)]">
          <QRCodeCanvas
            value={bookingUrl}
            size={240}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
          />
        </div>

        <p className="text-sm text-[#fff3b0] break-all font-bold">
          {bookingUrl}
        </p>

        <div className="mt-8 rounded-3xl bg-black/35 border border-[#d4af37]/20 p-4 w-full max-w-md">
          <p className="font-black text-lg text-[#fff3b0]">
            احجز بسرعة بدون انتظار
          </p>
          <p className="text-slate-400 text-sm mt-1">
            اختار الخدمة والمعاد المناسب من خلال الموبايل
          </p>
        </div>

        <footer className="text-center text-xs text-slate-500 py-6 leading-7 print:hidden">
          © 2026 Salon24. جميع الحقوق محفوظة.
          <div className="mt-2">تم تطوير النظام بواسطة</div>
          <div className="text-[#d4af37] font-bold">Eng: Abdo Hesham</div>
          <div className="text-[#d4af37] font-bold">Eng: Eslam Said</div>
        </footer>

        <div className="flex gap-2 mt-4 print:hidden">
          <a
            href={bookingUrl}
            target="_blank"
            className="flex-1 bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black p-4 rounded-2xl font-black"
          >
            فتح الموقع
          </a>

          <button
            onClick={() => window.print()}
            className="flex-1 bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] p-4 rounded-2xl font-black"
          >
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}
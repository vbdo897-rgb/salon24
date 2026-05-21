"use client";

import { QRCodeCanvas } from "qrcode.react";
export default function QRPage() {
  const bookingUrl = "https://salon24-beryl.vercel.app";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4 flex items-center justify-center"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-[#d4af37]/15 bg-white/[0.07] backdrop-blur-xl p-6 text-center">
        <h1 className="text-4xl font-black text-[#fff3b0] mb-3">
          QR الحجز
        </h1>

        <p className="text-slate-400 mb-6">
          امسح الكود للحجز مباشرة
        </p>

        <div className="bg-white p-5 rounded-3xl inline-block">
          <QRCodeCanvas
            value={bookingUrl}
            size={260}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
          />
        </div>

        <p className="mt-6 text-[#fff3b0] break-all font-bold">
          {bookingUrl}
        </p>

        <div className="flex gap-2 mt-6">
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
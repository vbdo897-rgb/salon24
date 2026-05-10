"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!password.trim()) {
      setMessage("❌ اكتب الباسورد الجديد");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage("❌ حصل خطأ أثناء تغيير الباسورد");
        return;
      }

      setMessage("✅ تم تغيير الباسورد بنجاح");

      setTimeout(() => {
        router.push("/admin");
      }, 2000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="w-full max-w-sm rounded-[2rem] border border-[#d4af37]/20 bg-white/[0.07] backdrop-blur-xl p-6 shadow-2xl space-y-4">

        <img
          src="/logo.png"
          alt="Salon24"
          className="mx-auto w-24 h-24 object-cover rounded-3xl border border-[#d4af37]/25"
        />

        <h1 className="text-4xl font-black text-center tracking-[0.15em] bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
          SALON 24
        </h1>

        <p className="text-center text-slate-400">
          تغيير كلمة المرور
        </p>

        <input
          type="password"
          placeholder="الباسورد الجديد"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-black/35 border border-white/10 rounded-2xl outline-none focus:border-[#d4af37]"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black p-4 rounded-2xl font-black disabled:opacity-50"
        >
          {loading ? "جاري التغيير..." : "تغيير الباسورد"}
        </button>

        {message && (
          <p className="text-center font-bold text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
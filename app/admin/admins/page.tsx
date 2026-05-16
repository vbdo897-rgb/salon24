"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const loadAdmins = async () => {
    const { data } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    setAdmins(data || []);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const addAdmin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("اكتب الإيميل والباسورد");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admins/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "حصل خطأ أثناء إضافة الأدمن");
        return;
      }

      alert("✅ تم إضافة الأدمن بنجاح");

      setEmail("");
      setPassword("");
      setRole("admin");

      await loadAdmins();
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminEmail: string) => {
    const ok = confirm(`متأكد إنك عايز تحذف الأدمن ${adminEmail}؟`);
    if (!ok) return;

    const res = await fetch("/api/admins/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "حصل خطأ أثناء حذف الأدمن");
      return;
    }

    alert("✅ تم حذف الأدمن");
    await loadAdmins();
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#8a641c] bg-clip-text text-transparent">
              إدارة الأدمنز
            </h1>

            <p className="text-slate-400 mt-2">
              إضافة وحذف حسابات الإدارة
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black text-center"
          >
            رجوع للأدمن
          </a>
        </div>

        <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5 space-y-3">
          <h2 className="text-2xl font-black text-[#fff3b0]">
            إضافة أدمن جديد
          </h2>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="إيميل الأدمن"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
            />

            <input
              type="password"
              placeholder="باسورد الأدمن"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-black/35 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37]"
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <button
            onClick={addAdmin}
            disabled={loading}
            className="w-full bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black p-4 rounded-2xl font-black disabled:opacity-50"
          >
            {loading ? "جاري الإضافة..." : "إضافة أدمن"}
          </button>
        </div>

        <div className="bg-white/[0.07] border border-[#d4af37]/15 rounded-[2rem] p-5">
          <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
            الأدمنز الحاليين
          </h2>

          {admins.length === 0 ? (
            <p className="text-slate-400 text-center py-10">
              لا يوجد أدمنز
            </p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.email}
                  className="bg-black/35 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-black text-lg">{admin.email}</p>
                    <p className="text-slate-400 text-sm">
                      الصلاحية: {admin.role || "admin"}
                    </p>
                  </div>

                  {admin.role !== "owner" && (
                    <button
                      onClick={() => deleteAdmin(admin.email)}
                      className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
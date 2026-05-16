"use client";

import { useEffect, useState } from "react";
import {
  addService,
  deleteService,
  getServices,
  updateService,
} from "@/lib/storage";

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<any[]>([]);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const [editingServiceId, setEditingServiceId] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");

  const loadServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      alert("اكتب اسم الخدمة");
      return;
    }

    try {
      await addService(newServiceName.trim(), Number(newServicePrice || 0));
      setNewServiceName("");
      setNewServicePrice("");
      await loadServices();
      alert("✅ تم إضافة الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء إضافة الخدمة");
    }
  };

  const startEditService = (s: any) => {
    setEditingServiceId(s.id);
    setEditServiceName(s.name);
    setEditServicePrice(String(s.price || 0));
  };

  const handleUpdateService = async () => {
    if (!editingServiceId || !editServiceName.trim()) {
      alert("اكتب اسم الخدمة");
      return;
    }

    try {
      await updateService(
        editingServiceId,
        editServiceName.trim(),
        Number(editServicePrice || 0)
      );

      setEditingServiceId("");
      setEditServiceName("");
      setEditServicePrice("");
      await loadServices();
      alert("✅ تم تعديل الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء تعديل الخدمة");
    }
  };

  const handleDeleteService = async (id: string) => {
    const ok = confirm("متأكد إنك عايز تحذف الخدمة؟");
    if (!ok) return;

    try {
      await deleteService(id);
      await loadServices();
      alert("✅ تم حذف الخدمة");
    } catch {
      alert("❌ حصل خطأ أثناء حذف الخدمة");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#18283f_0,#06111f_45%,#02040a_100%)] text-white p-4"
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-[#fff3b0]">
              الخدمات والأسعار
            </h1>
            <p className="text-slate-400 mt-2">
              إضافة وتعديل وحذف خدمات الصالون
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
          >
            رجوع
          </a>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
            إضافة خدمة جديدة
          </h2>

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="p-4 bg-black/35 border border-white/10 rounded-2xl outline-none focus:border-[#d4af37]"
              placeholder="اسم الخدمة"
            />

            <input
              type="number"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              className="p-4 bg-black/35 border border-white/10 rounded-2xl outline-none focus:border-[#d4af37]"
              placeholder="السعر"
            />
          </div>

          <button
            onClick={handleAddService}
            className="w-full bg-gradient-to-l from-[#fff3b0] via-[#d4af37] to-[#9a6b12] text-black p-4 rounded-2xl font-black"
          >
            إضافة خدمة
          </button>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5">
          <h2 className="text-2xl font-black text-[#fff3b0] mb-4">
            الخدمات الحالية
          </h2>

          {services.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              لا توجد خدمات
            </p>
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl bg-black/35 border border-white/10 p-4"
                >
                  {editingServiceId === s.id ? (
                    <div className="space-y-3">
                      <input
                        value={editServiceName}
                        onChange={(e) => setEditServiceName(e.target.value)}
                        className="w-full p-3 bg-black/35 border border-white/10 rounded-xl outline-none"
                        placeholder="اسم الخدمة"
                      />

                      <input
                        type="number"
                        value={editServicePrice}
                        onChange={(e) => setEditServicePrice(e.target.value)}
                        className="w-full p-3 bg-black/35 border border-white/10 rounded-xl outline-none"
                        placeholder="السعر"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateService}
                          className="flex-1 bg-green-500 text-black p-3 rounded-xl font-bold"
                        >
                          حفظ
                        </button>

                        <button
                          onClick={() => {
                            setEditingServiceId("");
                            setEditServiceName("");
                            setEditServicePrice("");
                          }}
                          className="flex-1 bg-slate-600 text-white p-3 rounded-xl font-bold"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xl font-black">{s.name}</p>
                        <p className="text-[#fff3b0] text-sm font-bold mt-1">
                          {s.price || 0} جنيه
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditService(s)}
                          className="bg-blue-500 px-4 py-2 rounded-xl font-bold"
                        >
                          تعديل
                        </button>

                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="bg-red-500 px-4 py-2 rounded-xl font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
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
"use client";

export default function NotificationsSettingsPage() {
  const enableNotifications = async () => {
    try {
      if (!("Notification" in window)) {
        alert("المتصفح لا يدعم الإشعارات");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("لازم توافق على الإشعارات");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey: Uint8Array.from(
          atob(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          ),
          (c) => c.charCodeAt(0)
        ),
      });

      await fetch("/api/save-subscription", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subscription,
        }),
      });

      alert("✅ تم تفعيل الإشعارات");
    } catch {
      alert("❌ حصل خطأ أثناء تفعيل الإشعارات");
    }
  };

  const disableNotifications = async () => {
    try {
      await fetch("/api/delete-subscription", {
        method: "POST",
      });

      alert("✅ تم إيقاف الإشعارات");
    } catch {
      alert("❌ حصل خطأ أثناء إيقاف الإشعارات");
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
              الإشعارات
            </h1>

            <p className="text-slate-400 mt-2">
              إدارة إشعارات الحجوزات الجديدة
            </p>
          </div>

          <a
            href="/admin"
            className="bg-black/35 border border-[#d4af37]/20 text-[#fff3b0] px-5 py-3 rounded-2xl font-black"
          >
            رجوع
          </a>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-white/[0.07] p-5 space-y-4">
          <button
            onClick={enableNotifications}
            className="w-full bg-green-500 text-black p-4 rounded-2xl font-black"
          >
            تفعيل الإشعارات
          </button>

          <button
            onClick={disableNotifications}
            className="w-full bg-red-600 text-white p-4 rounded-2xl font-black"
          >
            إيقاف الإشعارات
          </button>
        </div>
      </div>
    </div>
  );
}
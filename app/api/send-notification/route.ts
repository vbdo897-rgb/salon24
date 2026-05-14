import webpush from "web-push";
import { supabase } from "@/lib/supabase";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("id", "admin")
      .single();

    if (error || !data?.subscription) {
      return Response.json({ success: false, error: "No subscription found" });
    }

    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({
        title: "Salon24",
        body: "🔥 يوجد حجز جديد",
      })
    );

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}
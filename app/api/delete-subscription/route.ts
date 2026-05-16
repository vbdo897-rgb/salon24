import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("id", "admin");

    if (error) {
      return Response.json({ success: false, error: error.message });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false });
  }
}
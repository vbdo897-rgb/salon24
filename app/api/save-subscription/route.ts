import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        id: "admin",
        subscription: body.subscription,
      },
      { onConflict: "id" }
    );

    if (error) {
      return Response.json({ success: false, error: error.message });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false });
  }
}
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return Response.json({ success: false, error: "Email and password required" });
    }

    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return Response.json({ success: false, error: authError.message });
    }

    const { error: dbError } = await adminSupabase.from("admins").upsert(
      {
        email,
        role: role || "admin",
      },
      { onConflict: "email" }
    );

    if (dbError) {
      return Response.json({ success: false, error: dbError.message });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}
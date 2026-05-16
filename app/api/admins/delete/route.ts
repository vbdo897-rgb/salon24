import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ success: false, error: "Email required" });
    }

    const { data: usersData, error: listError } =
      await adminSupabase.auth.admin.listUsers();

    if (listError) {
      return Response.json({ success: false, error: listError.message });
    }

    const user = usersData.users.find((u) => u.email === email);

    if (user) {
      const { error: deleteAuthError } =
        await adminSupabase.auth.admin.deleteUser(user.id);

      if (deleteAuthError) {
        return Response.json({
          success: false,
          error: deleteAuthError.message,
        });
      }
    }

    const { error: dbError } = await adminSupabase
      .from("admins")
      .delete()
      .eq("email", email);

    if (dbError) {
      return Response.json({ success: false, error: dbError.message });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message });
  }
}
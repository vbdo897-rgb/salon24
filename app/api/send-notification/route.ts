import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const subscription = body.subscription;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Salon24",
        body: "🔥 يوجد حجز جديد",
      })
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false });
  }
}
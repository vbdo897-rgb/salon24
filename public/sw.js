self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Salon24", {
      body: data.body || "لديك حجز جديد",
      icon: "/logo.png",
      badge: "/logo.png",
    })
  );
});
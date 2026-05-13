export const metadata = {
  title: "Salon24 Admin",
  description: "Salon24 Admin Dashboard",

  manifest: "/admin-manifest.json",

  themeColor: "#d4af37",

  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
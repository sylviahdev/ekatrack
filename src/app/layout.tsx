import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "EkaTrack — Ekafarm Agri-Solutions",
  description: "Farm operations management for Ekafarm Agri-Solutions Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

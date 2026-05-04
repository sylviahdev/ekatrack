import "./globals.css";
import { Layout } from "@/components/Layout";

export const metadata = {
  title: "EkaTrack — Ekafarm Agri-Solutions",
  description: "Farm operations management for Ekafarm Agri-Solutions Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

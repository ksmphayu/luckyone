import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "LuckyOne 🔮 เช็กดวงชะตารายวันสุดแม่น",
  description: "เว็บดูดวงรายวันและวิเคราะห์ข้อมูลจากโปรไฟล์ของคุณ ทั้งเรื่องการงาน การเงิน ความรัก และสีเสื้อมงคล",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

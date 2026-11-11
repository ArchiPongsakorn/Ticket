import { Kanit, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});
const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata = {
  title: "งานเลี้ยงรุ่น CSI200",
  description: "บัตรเข้างานและของที่ระลึก งานเลี้ยงรุ่น CSI200",
};

export const viewport = {
  themeColor: "#0a1220",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} ${notoThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import Header from "@/components/layout/Header";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthCard from "@/components/auth/AuthCard";
import { cx } from "@/lib/cx";
import s from "@/components/auth/auth.module.css";

export const metadata = { title: "เข้าสู่ระบบ | TicketCSI200" };

/** /login (เปิดแท็บสมัครสมาชิกด้วย /login?tab=register) */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <div className={s.page}>
      <Header />
      <main className={cx("wrap", s.auth)}>
        <AuthIntro />
        <AuthCard initialTab={tab === "register" ? "register" : "login"} />
      </main>
    </div>
  );
}

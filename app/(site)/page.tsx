import Link from "next/link";
import Header from "@/components/layout/Header";
import HeroCarousel from "@/components/landing/Banner";
import InfoStrip from "@/components/landing/Box";
import OrderSteps from "@/components/landing/4";
import { cx } from "@/lib/cx";
import s from "@/components/landing/landing.module.css";
import HomeRoleRedirect from "@/components/auth/HomeRoleRedirect";

/** หน้าแรก (loading / welcome page) */
export default function HomePage() {
  return (
    <div className={s.page}>
      <HomeRoleRedirect />
      <Header current="home" />
      <main className={cx("wrap", s.stage)}>
        <HeroCarousel />
        <InfoStrip />
        <OrderSteps />
      </main>
    </div>
  );
}

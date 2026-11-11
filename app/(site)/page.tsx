import Link from "next/link";
import Header from "@/components/layout/Header";
import Sky from "@/components/landing/Sky";
import HeroCarousel from "@/components/landing/HeroCarousel";
import InfoStrip from "@/components/landing/InfoStrip";
import OrderSteps from "@/components/landing/OrderSteps";
import { cx } from "@/lib/cx";
import s from "@/components/landing/landing.module.css";

/** หน้าแรก (loading / welcome page) */
export default function HomePage() {
  return (
    <div className={s.page}>
      <Sky />
      <Header current="home"/>
      <main className={cx("wrap", s.stage)}>
        <HeroCarousel />
        <InfoStrip />
        <OrderSteps />
      </main>
    </div>
  );
}

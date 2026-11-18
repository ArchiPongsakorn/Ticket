"use client";
import Link from "next/link";
import { useCarousel } from "../../hooks/useCarousel";
import { cx } from "../../lib/cx";
import ArtTickets from "./Ticket-Card";
import ArtTee from "./T";
import s from "./landing.module.css";
import ShopLink from "@/components/auth/ShopLink";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** เนื้อหาโฆษณาแต่ละสไลด์ (เพิ่ม/แก้สไลด์ที่นี่) */
const SLIDES = [
  {
    id: "tickets",
    tone: "slideA",
    title: "งานเลี้ยงรุ่น CSI",
    text: "หนึ่งวันแห่งความทรงจำ กลับมาพบกันอีกครั้ง",
    cta: "ซื้อบัตร",
    Art: ArtTickets,
  },
  {
    id: "merch",
    tone: "slideB",
    title: "เสื้อและของที่ระลึก",
    text: "จองล่วงหน้าพร้อมบัตร รับของที่หน้างานโดยไม่ต้องรอคิว",
    cta: "เลือกซื้อ",
    Art: ArtTee,
  },
];

const Chevron = ({ d }: { d: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

export default function HeroCarousel() {
  const { index, cycle, goTo, next, prev, swipe } = useCarousel(SLIDES.length);

  return (
    <section
      className={cx(s.carousel, s.reveal)}
      style={{ "--d": ".1s" } as import("react").CSSProperties}
      aria-roledescription="carousel"
      aria-label="โฆษณางาน"
    >
      <div className={s.frame}>
        <div className={s.viewport} {...swipe}>
          <div
            className={s.track}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map(({ id, tone, title, text, cta, Art }, i) => {
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <article
                  key={id}
                  className={cx(s.slide, s[tone])}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} จาก ${SLIDES.length}`}
                >
                  <div className={s.copy}>
                    <Heading className={s.slideTitle}>{title}</Heading>
                    <p className={s.slideText}>{text}</p>
                    <div className={s.slideActions}>
                      <ShopLink className="btn">{cta}</ShopLink>

                      {/* <Link className="btn btn-ghost" href="/shop">รายละเอียด</Link>   ปุ่มรายละเอียด  */}
                    </div>
                  </div>
                  <Art />
                </article>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={cx(s.arrow, s.arrowPrev)}
          onClick={prev}
          aria-label="โฆษณาก่อนหน้า"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <button
          type="button"
          className={cx(s.arrow, s.arrowNext)}
          onClick={next}
          aria-label="โฆษณาถัดไป"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>

      <div className={s.dots} role="tablist" aria-label="เลือกโฆษณา">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`โฆษณาที่ ${i + 1}`}
            className={cx(s.dot, i === index && s.isActive)}
            onClick={() => goTo(i)}
          >
            <span className={s.dotTrack}>
              {i === index && (
                <span key={`${slide.id}-${cycle}`} className={s.dotFill} />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

"use client";
import { useEffect, useState } from "react";
import s from "./landing.module.css";

const LANTERN_COUNT = 8;

/** พื้นหลังดาวและโคมลอย (สุ่มตำแหน่งหลัง mount เพื่อไม่ให้ hydration ไม่ตรงกัน) */
export default function Sky() {
  const [lanterns, setLanterns] = useState<Array<{left: string; scale: string; drift: string; duration: string; delay: string}>>([]);

  useEffect(() => {
    setLanterns(
      Array.from({ length: LANTERN_COUNT }, () => ({
        left: `${5 + Math.random() * 90}%`,
        scale: (0.7 + Math.random() * 0.8).toFixed(2),
        drift: `${Math.random() * 80 - 40}px`,
        duration: `${18 + Math.random() * 14}s`,
        delay: `${-Math.random() * 24}s`,
      }))
    );
  }, []);

  return (
    <div className={s.sky} aria-hidden="true">
      {lanterns.map((l, i) => (
        <span key={i} className={s.lantern} style={{ left: l.left, scale: l.scale, "--drift": l.drift, animationDuration: l.duration, animationDelay: l.delay } as import("react").CSSProperties} />
      ))}
    </div>
  );
}

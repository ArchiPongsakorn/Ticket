"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ตั้งเวลาเปลี่ยนสไลด์ตรงนี้
const AUTO_SLIDE_TIME = 7000; // 1000 = 1s

export function useCarousel(count: number) {
  //เก็บตำแหน่งสไลด์
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  const startX = useRef<number | null>(null);

  // เลือกสไลด์
  const goTo = useCallback(
    (i: number) => {
      if (count <= 0) return;
      setIndex((i + count) % count);
      setCycle((c) => c + 1);
    },
    [count],
  );

  // เลื่อนซ้าย / ขวา
  const step = useCallback(
    (direction: number) => {
      if (count <= 1) return;

      setIndex((i) => (i + direction + count) % count);

      setCycle((c) => c + 1);
    },
    [count],
  );

  // เลื่อนสไลด์อัตโนมัติ
  useEffect(() => {
    // 1<return
    if (count <= 1) return;
    //ตั้งเวลา "" = s1
    const timer = window.setTimeout(() => {
      step(1);
    }, AUTO_SLIDE_TIME);
    
    return () => window.clearTimeout(timer);
  }, [count, cycle, step]);

  // ปัดนิ้วบนมือถือ
  const swipe = {
    onPointerDown: (e: import("react").PointerEvent) => {
      startX.current = e.clientX;
    },

    onPointerUp: (e: import("react").PointerEvent) => {
      if (
        startX.current !== null &&
        Math.abs(e.clientX - startX.current) > 40
      ) {
        step(e.clientX < startX.current ? 1 : -1);
      }

      startX.current = null;
    },
  };

  return {
    index,
    cycle,
    goTo,
    next: () => step(1),
    prev: () => step(-1),
    swipe,
  };
}

"use client";
import { useEffect, useRef, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

/** useState ที่จำค่าไว้ใน localStorage (โหลดหลัง mount เพื่อไม่ให้ hydration ไม่ตรงกัน) */
export function usePersistentState<T>(key: string, initial: T): [T, import("react").Dispatch<import("react").SetStateAction<T>>, boolean] {
  const initialRef = useRef(initial);
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readJSON(key, initialRef.current));
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) writeJSON(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready];
}

"use client";
import type { CartLine } from "../types/domain";
import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { PRODUCTS_BY_ID } from "../data/catalog";
import { lineKey, summarize } from "../lib/cart";

/** ตะกร้าสินค้า: บัตรและของที่ระลึกเป็นสินค้าอิสระต่อกัน (ซื้ออย่างใดอย่างหนึ่งได้) */
export function useCart() {
  const [stored, setStored] = usePersistentState<CartLine[]>("ticket-cart", []);

  const lines = useMemo(
    () => stored.filter((l) => PRODUCTS_BY_ID[l.id] && l.qty > 0),
    [stored]
  );

  const add = useCallback((id: string, option = "") => {
    const max = PRODUCTS_BY_ID[id].max;
    setStored((prev) => {
      const found = prev.find((l) => l.id === id && l.option === option);
      if (!found) return [...prev, { id, option, qty: 1 }];
      return prev.map((l) => (l === found ? { ...l, qty: Math.min(max, l.qty + 1) } : l));
    });
  }, [setStored]);

  const changeQty = useCallback((key: string, delta: number) => {
    setStored((prev) =>
      prev
        .map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(PRODUCTS_BY_ID[l.id].max, l.qty + delta) } : l))
        .filter((l) => l.qty > 0)
    );
  }, [setStored]);

  const remove = useCallback((key: string) => setStored((prev) => prev.filter((l) => lineKey(l) !== key)), [setStored]);
  const clear = useCallback(() => setStored([]), [setStored]);

  return { lines, add, changeQty, remove, clear, totals: useMemo(() => summarize(lines), [lines]) };
}

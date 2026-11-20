"use client";
import type { CartLine, Product } from "../types/domain";
import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { PRODUCTS_BY_ID } from "../data/catalog";
import { lineKey, summarize } from "../lib/cart";

/** ตะกร้าสินค้า(ซื้ออย่างใดอย่างหนึ่งได้) */
export function useCart(productsById: Record<string, Product> = PRODUCTS_BY_ID) {
  //ใช้ use จัดการข้อมูล key  
  const [stored, setStored] = usePersistentState<CartLine[]> ("ticket-cart", []);

  const lines = useMemo(
    () => stored.filter((l) => productsById[l.id] && l.qty > 0),
    [stored, productsById],
  );

  const add = useCallback(
    (id: string, option = "") => {
      const max = productsById[id].max;
      setStored((prev) => {
        //
        //find id 
        // id option qty 
        const found = prev.find((l) => l.id === id && l.option === option);
        //
        if (!found) return [...prev, { id, option, qty: 1 }];

        return prev.map((l) =>
          l === found ? { ...l, qty: Math.min(max, l.qty + 1) } : l,
        );
      });
    },
    [productsById, setStored],
  );

  const changeQty = useCallback(
    (key: string, delta: number) => {
      setStored((prev) =>
        prev
          .map((l) =>
            lineKey(l) === key
              ? { ...l, qty: Math.min(productsById[l.id].max, l.qty + delta) }
              : l,
          )
          .filter((l) => l.qty > 0),
      );
    },
    [productsById, setStored],
  );

  const remove = useCallback(
    (key: string) =>
      setStored((prev) => prev.filter((l) => lineKey(l) !== key)),
    [setStored],
  );
  const clear = useCallback(() => setStored([]), [setStored]);

  return {
    lines,
    add,
    changeQty,
    remove,
    clear,
    
    totals: useMemo(() => summarize(lines, productsById), [lines, productsById]),
  };
}

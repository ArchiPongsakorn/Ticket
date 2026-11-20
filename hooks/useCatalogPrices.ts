"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG } from "../data/catalog";
import type { Product } from "../types/domain";
import { CATALOG_CHANGED_EVENT, readCatalog } from "@/lib/catalog-storage";

export const PRICE_STORAGE_KEY = "admin-catalog-prices";
const PRICE_EVENT = CATALOG_CHANGED_EVENT;

function readPrices(): Record<string, number> {
  try {
    const saved = window.localStorage.getItem(PRICE_STORAGE_KEY);
    return saved ? JSON.parse(saved) as Record<string, number> : {};
  } catch {
    return {};
  }
}

export function notifyCatalogPricesChanged() {
  window.dispatchEvent(new Event(PRICE_EVENT));
}

export default function useCatalogPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [catalog, setCatalog] = useState<Product[]>(CATALOG);

  useEffect(() => {
    const update = () => {
      setPrices(readPrices());
      setCatalog(readCatalog());
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener(PRICE_EVENT, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(PRICE_EVENT, update);
    };
  }, []);

  const products = useMemo(
    () => catalog.map((product) => ({
      ...product,
      price: Number.isFinite(prices[product.id]) ? prices[product.id] : product.price,
    })),
    [catalog, prices],
  );
  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])) as Record<string, Product>,
    [products],
  );

  return { products, productsById };
}

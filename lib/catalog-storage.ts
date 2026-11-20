import { CATALOG } from "@/data/catalog";
import type { Product } from "@/types/domain";

export const CATALOG_STORAGE_KEY = "admin-catalog-products";
export const CATALOG_CHANGED_EVENT = "catalog-products-updated";

export function readCatalog(): Product[] {
  if (typeof window === "undefined") return CATALOG;
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return CATALOG;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return CATALOG;
    return parsed.filter((item): item is Product =>
      item && typeof item.id === "string" &&
      (item.type === "ticket" || item.type === "merch") &&
      typeof item.name === "string" && typeof item.price === "number" &&
      Number.isFinite(item.price),
    );
  } catch {
    return CATALOG;
  }
}

export function saveCatalog(products: Product[]) {
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(CATALOG_CHANGED_EVENT));
}

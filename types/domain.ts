/** Shared domain contracts for the storefront and future administration API. */
export type ProductKind = "ticket" | "merch";
export type DeliveryMethod = "pickup" | "delivery";
export interface Product {
  id: string;
  type: ProductKind;
  name: string;
  desc: string;
  price: number;
  glyph: string;
  max: number;
  was?: number;
  tokens?: number;
  perks?: string[];
  optionLabel?: string;
  options?: string[];
  sizeGuide?: boolean;
}
export interface CartLine { id: string; option: string; qty: number }
export interface CartTotals { count: number; total: number; tokens: number; hasTicket: boolean; hasMerch: boolean }
export interface OrderUnit { key: string; id: string; option: string; kind: ProductKind }
export type FormValues = Record<string, string | undefined>;
export type AttendeeValues = Record<string, string | undefined> & { method?: DeliveryMethod }
export type AttendeesByUnit = Record<string, AttendeeValues>;
export type FieldErrors = Record<string, string>;
export type UnitErrors = Record<string, FieldErrors>;
export type FieldDefinition = {
  name: string; label: string; type: string;
  validate: (value: string, values: FormValues) => string;
  sanitize?: (value: string) => string;
  full?: boolean; hint?: string; inputMode?: "numeric" | "text" | "tel" | "email" | "decimal" | "search" | "url" | "none";
  autoComplete?: string; placeholder?: string; meter?: boolean;
};
export type AuthMode = "login" | "register";
export type AuthDone = { title: string; text: string };
export interface CheckoutResult { no: string; tickets: number; pickup: number; delivery: number; email?: string }

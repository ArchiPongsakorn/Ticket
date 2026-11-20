import { readJSON, writeJSON } from "@/lib/storage";
import { getCurrentUser } from "@/lib/local-auth";
import { readCatalog } from "@/lib/catalog-storage";

export const CUSTOMER_ORDERS_STORAGE_KEY = "ticket-orders";

export type CustomerOrder = {
  id: string;
  event: string;
  tier: string;
  date: string;
  qty: number;
  total: number;
  prices: Record<string, number>;
  bonusToken: number;
  status: "paid" | "pending" | "review" | "rejected";
  orderedAt: string;
  ownerEmail?: string;
  buyerName?: string;
  hasMerch?: boolean;
  shippingAddress?: string;
  items?: Array<{ id: string; name: string; qty: number; type: "ticket" | "merch" }>;
  slipUrl?: string;
  tickets?: Array<{ code: string; name: string; type: string; email: string; tokens: number }>;
};

type OrderRequest = {
  lines: Array<{ id: string; option: string; qty: number }>;
  tickets: Array<{ ticket: string; first?: string; last?: string; email?: string }>;
  pieces: Array<{ name?: string; addr?: string; method?: string; email?: string }>;
  pay: string;
  total: number;
  prices: Record<string, number>;
};

export async function createOrder(order: OrderRequest) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const orderNo =
    "MF" + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
  const products = Object.fromEntries(readCatalog().map((product) => [product.id, product]));
  const user = getCurrentUser();
  const tickets = order.tickets.map((ticket, index) => {
    const product = products[ticket.ticket];
    const code = `${orderNo}-${String(index + 1).padStart(2, "0")}`;
    const name = [ticket.first, ticket.last].filter(Boolean).join(" ") || user?.username || "ผู้ถือบัตร";
    return {
      code,
      name,
      type: product?.name ?? ticket.ticket,
      email: ticket.email || user?.email || "",
    tokens: product?.tokens ?? 0,
    };
  });
  const buyerName = order.pieces.find((piece) => piece.name)?.name || tickets[0]?.name || user?.username;
  const shippingAddress = order.pieces.find((piece) => piece.method === "delivery" && piece.addr?.trim())?.addr?.trim();
  const newOrder: CustomerOrder = {
    id: orderNo,
    event: "งานเลี้ยงรุ่น SPU",
    tier: order.lines.map((line) => {
      const product = products[line.id];
      return `${product?.name ?? line.id}${line.option ? ` (${line.option})` : ""} × ${line.qty}`;
    }).join(" · "),
    date: "20 ธ.ค. 2569 · มหาวิทยาลัยศรีปทุม",
    qty: order.lines.reduce((sum, line) => sum + line.qty, 0),
    total: order.total,
    prices: order.prices,
    bonusToken: order.lines.reduce(
      (sum, line) => sum + (products[line.id]?.tokens ?? 0) * line.qty,
      0,
    ),
    status: "pending",
    orderedAt: new Date().toLocaleString("th-TH"),
    ownerEmail: user?.email,
    buyerName,
    hasMerch: order.pieces.length > 0,
    shippingAddress,
    items: order.lines.map((line) => ({
      id: line.id,
      name: products[line.id]?.name ?? line.id,
      qty: line.qty,
      type: products[line.id]?.type ?? "ticket",
    })),
    tickets,
  };
  const orders = readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []);
  writeJSON(CUSTOMER_ORDERS_STORAGE_KEY, [newOrder, ...orders]);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ticket:orders-updated"));
  const attendees = readJSON<Array<Record<string, unknown>>>("admin-event-attendees", []);
  writeJSON("admin-event-attendees", [
    ...tickets.map((ticket) => ({
      id: ticket.code,
      name: ticket.name,
      type: ticket.type,
      tokens: 0,
      checkedIn: false,
      active: false,
      email: ticket.email,
      ownerEmail: ticket.email,
      orderId: orderNo,
    })),
    ...attendees,
  ]);
  return { ok: true, orderNo, order: newOrder };
}

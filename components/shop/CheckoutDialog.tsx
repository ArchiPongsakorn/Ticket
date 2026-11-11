"use client";
import type { CartLine, CartTotals, OrderUnit, AttendeesByUnit, CheckoutResult } from "../../types/domain";

import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { PRODUCTS_BY_ID } from "../../data/catalog";
import { createOrder } from "../../lib/api";
import { baht, num } from "../../lib/format";
import s from "./shop.module.css";

const METHOD_LABEL: Record<import("../../types/domain").DeliveryMethod, string> = { pickup: "รับที่งาน", delivery: "จัดส่ง" };
const pieceName = (u: OrderUnit) => `${PRODUCTS_BY_ID[u.id].name}${u.option ? ` (${u.option})` : ""}`;

/** ขั้นที่ 3: ตรวจสอบคำสั่งซื้อ เลือกวิธีชำระเงิน แล้วแสดงผลสำเร็จ */
export default function CheckoutDialog({ open, onClose, lines, totals, units, attendees, shipping, onSuccess }: { open: boolean; onClose: () => void; lines: CartLine[]; totals: CartTotals; units: OrderUnit[]; attendees: AttendeesByUnit; shipping: number; onSuccess: () => void }) {
  const [pay, setPay] = useState("promptpay");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<CheckoutResult | null>(null);

  const tickets = units.filter((u) => u.kind === "ticket");
  const pieces = units.filter((u) => u.kind === "merch");
  const methodOf = (u: OrderUnit) => attendees[u.key]?.method;

  useEffect(() => {
    if (open) { setOrder(null); setBusy(false); }
  }, [open]);

  async function confirm() {
    setBusy(true);
    const result = await createOrder({
      lines,
      tickets: tickets.map((u) => ({ ticket: u.id, ...attendees[u.key] })),
      pieces: pieces.map((u) => ({ item: u.id, option: u.option, ...attendees[u.key] })),
      pay,
      total: totals.total + shipping,
    });
    setOrder({
      no: result.orderNo,
      tickets: tickets.length,
      pickup: pieces.filter((u) => methodOf(u) === "pickup").length,
      delivery: pieces.filter((u) => methodOf(u) === "delivery").length,
      email: attendees[pieces[0]?.key ?? ""]?.email,
    });
    setBusy(false);
    onSuccess(); // ล้างตะกร้าและข้อมูลที่กรอก
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="dlgTitle">
      <div className={s.dlg}>
        {order ? (
          <div className={s.done}>
            <div className={s.doneIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
            </div>
            <h2 id="dlgTitle">สั่งซื้อสำเร็จ</h2>
            <code>{order.no}</code>
            <p>{order.tickets ? `ส่งบัตรอิเล็กทรอนิกส์ไปที่อีเมลของผู้เข้างานทั้ง ${order.tickets} คนแล้ว` : `ส่งใบยืนยันคำสั่งซื้อไปที่ ${order.email} แล้ว`}</p>
            {order.pickup > 0 && <p>ของที่ระลึก {order.pickup} ชิ้นรับได้ที่จุดรับสินค้าภายในงาน</p>}
            {order.delivery > 0 && <p>ของที่ระลึก {order.delivery} ชิ้นจะจัดส่งตามที่อยู่ที่ให้ไว้</p>}
            <button className="btn btn-block" type="button" onClick={onClose}>ปิด</button>
          </div>
        ) : (
          <>
            <h2 id="dlgTitle">ตรวจสอบคำสั่งซื้อ</h2>
            <ul className={s.dlgList}>
              {lines.map((l) => {
                const p = PRODUCTS_BY_ID[l.id];
                return <li key={`${l.id}-${l.option}`}><span>{p.name}{l.option && ` (${l.option})`} × {l.qty}</span><span>{baht(l.qty * p.price)}</span></li>;
              })}
              {totals.tokens > 0 && <li><span>โบนัส token ที่ได้รับ</span><span>{num(totals.tokens)} token</span></li>}
              {shipping > 0 && <li><span>ค่าจัดส่ง ({pieces.filter((u) => methodOf(u) === "delivery").length} ชิ้น)</span><span>{baht(shipping)}</span></li>}
              <li><strong>ยอดรวม</strong><strong>{baht(totals.total + shipping)}</strong></li>
            </ul>

            {pieces.length > 0 && (
              <div>
                <p className={s.optsLabel}>ผู้รับของที่ระลึกและวิธีรับ</p>
                <ul className={s.dlgList}>
                  {pieces.map((u) => {
                    const d = attendees[u.key] || {};
                    return (
                      <li key={u.key}>
                        <span>{pieceName(u)}: {d.name}{methodOf(u) === "delivery" && d.addr ? ` | ${d.addr}` : ""}</span>
                        <span>{METHOD_LABEL[methodOf(u) as keyof typeof METHOD_LABEL] ?? ""}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {tickets.length > 0 && (
              <div>
                <p className={s.optsLabel}>ผู้ถือบัตรและอีเมลที่รับบัตร</p>
                <ul className={s.dlgList}>
                  {tickets.map((u) => (
                    <li key={u.key}><span>{PRODUCTS_BY_ID[u.id].name}: {attendees[u.key]?.first} {attendees[u.key]?.last}</span><span>{attendees[u.key]?.email}</span></li>
                  ))}
                </ul>
              </div>
            )}

            <fieldset className={s.pay}>
              <legend>วิธีชำระเงิน</legend>
              <label><input type="radio" name="pay" checked={pay === "promptpay"} onChange={() => setPay("promptpay")} /> PromptPay (สแกน QR)</label>
              <label><input type="radio" name="pay" checked={pay === "card"} onChange={() => setPay("card")} /> บัตรเครดิตหรือเดบิต</label>
            </fieldset>

            <div className={s.dlgActions}>
              <button className="btn btn-ghost" type="button" onClick={onClose}>กลับไปแก้ไข</button>
              <button className="btn" type="button" onClick={confirm} disabled={busy}>{busy ? "กำลังดำเนินการ..." : "ยืนยันและชำระเงิน"}</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

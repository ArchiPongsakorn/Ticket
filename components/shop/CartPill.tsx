import { cx } from "../../lib/cx";
import s from "./shop.module.css";

/** ปุ่มตะกร้าบน Header (กดแล้วเลื่อนไปที่ตะกร้า) */
export default function CartPill({ count }: { count: number }) {
  return (
    <a className={s.cartPill} href="#cart" aria-label="ไปที่ตะกร้า">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h13l-1.5 9h-10zM6 7 5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" />
      </svg>
      <span>ตะกร้า</span>
      <b key={count} className={cx(s.cartCount, s.bump)}>{count}</b>
    </a>
  );
}

import type { CartLine, CartTotals } from "../../types/domain";
import { PRODUCTS_BY_ID } from "../../data/catalog";
import { lineKey } from "../../lib/cart";
import { baht, num } from "../../lib/format";
import s from "./shop.module.css";

/** ตะกร้าฝั่งขวา: ปรับจำนวน ลบรายการ ดูยอดรวมและ token */
export default function CartPanel({ lines, totals, onQty, onRemove, onCheckout }: { lines: CartLine[]; totals: CartTotals; onQty: (key: string, delta: number) => void; onRemove: (key: string) => void; onCheckout: () => void }) {
  const has = totals.count > 0;
  const note = !has ? "" :
    totals.hasTicket && totals.hasMerch ? "ขั้นถัดไปกรอกข้อมูลของบัตรและของที่ระลึกแต่ละชิ้น และติ๊กเลือกรับที่งานหรือจัดส่ง" :
    totals.hasTicket ? "ขั้นถัดไปกรอกข้อมูลผู้ถือบัตรแต่ละใบ อยากได้เสื้อด้วยก็เพิ่มได้เลย" :
    "ซื้อเฉพาะของที่ระลึกได้ ขั้นถัดไปกรอกข้อมูลแต่ละชิ้นและติ๊กเลือกรับที่งานหรือจัดส่ง";

  return (
    <aside className={s.cart} id="cart" aria-labelledby="cartTitle">
      <h2 id="cartTitle">ตะกร้าของคุณ</h2>
      {!has && <p className={s.cartEmpty}>ยังไม่มีสินค้า เลือกบัตรหรือของที่ระลึกที่ชอบได้เลย</p>}

      <ul className={s.lines}>
        {lines.map((l) => {
          const p = PRODUCTS_BY_ID[l.id];
          const key = lineKey(l);
          return (
            <li key={key} className={s.line}>
              <div>
                <p className={s.lineName}>{p.name}</p>
                {l.option && <p className={s.lineOpt}>{p.optionLabel}: {l.option}</p>}
                {(p.tokens ?? 0) > 0 && <p className={s.lineOpt}>โบนัส {num((p.tokens ?? 0) * l.qty)} token</p>}
              </div>
              <p className={s.lineTotal}>{baht(l.qty * p.price)}</p>
              <div className={s.lineCtrl}>
                <button className={s.step} type="button" onClick={() => onQty(key, -1)} aria-label={`ลดจำนวน ${p.name}`}>−</button>
                <span className={s.qty} aria-live="polite">{l.qty}</span>
                <button className={s.step} type="button" onClick={() => onQty(key, 1)} disabled={l.qty >= p.max} aria-label={`เพิ่มจำนวน ${p.name}`}>+</button>
                <button className={s.remove} type="button" onClick={() => onRemove(key)}>ลบ</button>
              </div>
            </li>
          );
        })}
      </ul>

      {has && (
        <div className={s.sum}>
          <div className={s.sumRow}><span>จำนวนสินค้า</span><span>{totals.count} ชิ้น</span></div>
          {totals.tokens > 0 && <div className={s.sumRow}><span>โบนัส token ที่ได้รับ</span><span>{num(totals.tokens)} token</span></div>}
          <div className={s.sumRow}><span>ค่าจัดส่ง</span><span>{totals.hasMerch ? "เลือกในขั้นถัดไป" : "ไม่มี"}</span></div>
          <div className={`${s.sumRow} ${s.sumRowTotal}`}><span>ยอดรวม</span><span>{baht(totals.total)}</span></div>
        </div>
      )}

      <p className={s.cartNote} aria-live="polite">{note}</p>
      <button className="btn btn-block" type="button" disabled={!has} onClick={onCheckout}>ต่อไป: กรอกข้อมูลการสั่งซื้อ</button>
    </aside>
  );
}

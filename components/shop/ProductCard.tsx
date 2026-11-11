"use client";
import type { Product } from "../../types/domain";

import { useState } from "react";
import { baht, num } from "../../lib/format";
import s from "./shop.module.css";

/** การ์ดสินค้า 1 ชิ้น (ราคาและปุ่มเพิ่มลงตะกร้าชิดล่างเสมอด้วย CSS) */
export default function ProductCard({ product: p, selected, onSelect, onAdd, onSizeGuide }: { product: Product; selected?: string; onSelect: (id: string, option: string) => void; onAdd: (id: string) => void; onSizeGuide: () => void }) {
  const [justAdded, setJustAdded] = useState(false);
  const labelId = `ol-${p.id}`;

  const handleAdd = () => {
    onAdd(p.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  return (
    <article className={s.card}>
      <div className={s.poster}>
        <span className={s.badge}>{p.type === "ticket" ? "บัตร" : "ของที่ระลึก"}</span>
        <span className={s.glyph} aria-hidden="true">{p.glyph}</span>
      </div>
      <h3>{p.name}</h3>
      <p className={s.desc}>{p.desc}</p>

      {p.perks && <ul className={s.perkList}>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>}
      {(p.tokens ?? 0) > 0 && <span className={s.token}>+{num(p.tokens ?? 0)} token โบนัส</span>}

      {p.options && (
        <div>
          <p className={s.optsLabel} id={labelId}>
            {p.optionLabel}
            {p.sizeGuide && <button className={s.linkbtn} type="button" onClick={onSizeGuide}>ดูตารางไซซ์</button>}
          </p>
          <div className={s.opts} role="group" aria-labelledby={labelId}>
            {p.options.map((o) => (
              <button key={o} type="button" className={s.opt} aria-pressed={selected === o} onClick={() => onSelect(p.id, o)}>{o}</button>
            ))}
          </div>
        </div>
      )}

      <div className={s.buy}>
        <p className={s.price}>
          {p.was && <small>{baht(p.was)}</small>}
          <span><b>{num(p.price)}</b> บาท</span>
        </p>
        <button type="button" className="btn btn-sm" onClick={handleAdd}>{justAdded ? "เพิ่มแล้ว" : "เพิ่มลงตะกร้า"}</button>
      </div>
    </article>
  );
}

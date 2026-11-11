import ProductCard from "./ProductCard";
import { CATALOG, GROUPS } from "../../data/catalog";
import s from "./shop.module.css";

/** รายการสินค้าแยกกลุ่ม: บัตรเข้างาน / ของที่ระลึก */
export default function ProductCatalog({ picked, onPick, onAdd, onSizeGuide }: { picked: Record<string, string>; onPick: (id: string, option: string) => void; onAdd: (id: string) => void; onSizeGuide: () => void }) {
  return (
    <div>
      {GROUPS.map((g) => (
        <section key={g.type} className={s.group} aria-labelledby={`g-${g.type}`}>
          <h2 className={s.groupTitle} id={`g-${g.type}`}>{g.title}</h2>
          <p className={s.groupSub}>{g.sub}</p>
          <div className={s.grid}>
            {CATALOG.filter((p) => p.type === g.type).map((p) => (
              <ProductCard key={p.id} product={p} selected={picked[p.id]} onSelect={onPick} onAdd={onAdd} onSizeGuide={onSizeGuide} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

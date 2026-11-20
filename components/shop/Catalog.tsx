import ProductCard from "./Card";
import { GROUPS } from "../../data/catalog";
import type { Product } from "../../types/domain";
import s from "./shop.module.css";

/** รายการสินค้าแยกกลุ่ม: บัตรเข้างาน / ของที่ระลึก */
export default function ProductCatalog({
  picked,
  products,
  onPick,
  onAdd,
  onSizeGuide,
}: {
  picked: Record<string, string>;
  products: Product[];
  onPick: (id: string, option: string) => void;
  onAdd: (id: string) => void;
  onSizeGuide: () => void;
}) {
  return (
    <div>
      {GROUPS.map((g) => (
        <section
          key={g.type}
          className={s.group}
          aria-labelledby={`g-${g.type}`}
        >
          <h2 className={s.groupTitle} id={`g-${g.type}`}>
            {g.title}
          </h2>
          <p className={s.groupSub}>{g.sub}</p>
          <div className={s.grid}>
            {/* fil - array  */}
            {products.filter((p) => p.type === g.type).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                selected={picked[p.id]}
                onSelect={onPick}
                onAdd={onAdd}
                onSizeGuide={onSizeGuide}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

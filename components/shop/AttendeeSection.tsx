"use client";
import type { OrderUnit, AttendeesByUnit, UnitErrors, FieldDefinition, DeliveryMethod } from "../../types/domain";

import Field from "../ui/Field";
import { fieldsForUnit } from "../../data/forms";
import { PRODUCTS_BY_ID, SHIPPING_FEE } from "../../data/catalog";
import { validateFields, today } from "../../lib/validators";
import { baht, num } from "../../lib/format";
import { cx } from "../../lib/cx";
import s from "./shop.module.css";

const METHODS: Array<{value: DeliveryMethod; title: string; desc: string}> = [
  { value: "pickup", title: "รับที่งาน", desc: "ฟรี รับที่จุดรับสินค้าภายในงาน" },
  { value: "delivery", title: "จัดส่งถึงบ้าน", desc: `ค่าจัดส่ง ${baht(SHIPPING_FEE)} ต่อชิ้น` },
];

/**
 * การ์ดรายชิ้น 1 ใบต่อ 1 รายการ ต้องกรอกให้ครบทุกใบ และตัวนับรวมทุกรายการ
 * - บัตร: ชื่อ นามสกุล วันเกิด เบอร์โทร อีเมล
 * - ของที่ระลึก: ติ๊กรับที่งาน/จัดส่ง + ชื่อ-นามสกุล เบอร์โทร อีเมล ที่อยู่ (ที่อยู่จำเป็นเฉพาะเมื่อจัดส่ง)
 * ข้อมูลของแต่ละรายการเก็บใน attendees[unit.key] (ของที่ระลึกมีคีย์ method รวมอยู่ด้วย)
 */
export default function AttendeeSection({ units, attendees, errors, onChange, onMethod }: { units: OrderUnit[]; attendees: AttendeesByUnit; errors: UnitErrors; onChange: (key: string, field: FieldDefinition, value: string) => void; onMethod: (key: string, method: DeliveryMethod) => void }) {
  const complete = (u: OrderUnit) => {
    const data = attendees[u.key] || {};
    const noFieldErrors = Object.keys(validateFields(fieldsForUnit(u), data)).length === 0;
    return u.kind === "ticket" ? noFieldErrors : Boolean(data.method) && noFieldErrors;
  };
  const doneCount = units.filter(complete).length;
  const maxDate = today();

  return (
    <div className={s.attWrap}>
      <div className={s.attendHead}>
        <h2 className={s.groupTitle}>ข้อมูลผู้ถือบัตรและผู้รับของที่ระลึกแต่ละชิ้น</h2>
        <p className={s.attendProgress} aria-live="polite">กรอกครบแล้ว {doneCount}/{units.length} รายการ</p>
      </div>
      <p className={s.groupSub}>ต้องกรอกให้ครบทุกรายการ ของที่ระลึกให้ติ๊กเลือกว่ารับที่งานหรือจัดส่ง (ที่อยู่ต้องกรอกเฉพาะเมื่อจัดส่ง)</p>

      <div className={s.attList}>
        {units.map((u, i) => {
          const p = PRODUCTS_BY_ID[u.id];
          const data = attendees[u.key] || {};
          const ok = complete(u);
          const sub = u.kind === "ticket"
            ? `${baht(p.price)} | ${p.tokens ? `โบนัส ${num(p.tokens)} token` : "ไม่มี token โบนัส"}`
            : baht(p.price);
          return (
            <details key={u.key} id={`card-${u.key}`} className={s.ticketCard} open>
              <summary>
                <span className={s.tcNum}>{i + 1}</span>
                <span className={s.tcText}>
                  <span className={s.tcTitle}>{p.name}{u.option ? ` (${u.option})` : ""}</span>
                  <span className={s.tcSub}>{sub}</span>
                </span>
                <span className={cx(s.tcStatus, ok && s.ok)}>{ok ? "กรอกครบแล้ว" : "ยังไม่ครบ"}</span>
              </summary>

              <div className={s.tcBody}>
                {u.kind === "merch" && (
                  <>
                    <div className={s.pieceMethods} role="radiogroup" aria-label={`วิธีรับ ${p.name}`}>
                      {METHODS.map((m) => (
                        <label key={m.value} className={s.method}>
                          <input id={`${u.key}-${m.value}`} type="radio" name={`m-${u.key}`} value={m.value}
                            checked={data.method === m.value} onChange={() => onMethod(u.key, m.value)} />
                          <span><b>{m.title}</b><small>{m.desc}</small></span>
                        </label>
                      ))}
                    </div>
                    {errors[u.key]?.method && <p className={s.pieceError}>{errors[u.key].method}</p>}
                  </>
                )}
                {fieldsForUnit(u).map((f) => (
                  <Field
                    key={f.name}
                    id={`${u.key}-${f.name}`}
                    label={f.label}
                    type={f.type}
                    full={f.full}
                    hint={f.hint}
                    inputMode={f.inputMode}
                    max={f.type === "date" ? maxDate : undefined}
                    value={data[f.name] ?? ""}
                    error={errors[u.key]?.[f.name]}
                    onChange={(v) => onChange(u.key, f, v)}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

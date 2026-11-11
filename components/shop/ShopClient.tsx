"use client";
import type {
  OrderUnit,
  FieldDefinition,
  AttendeesByUnit,
  UnitErrors,
  DeliveryMethod,
} from "../../types/domain";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../layout/Header";
import CartPill from "./CartPill";
import Stepper from "./Stepper";
import ProductCatalog from "./ProductCatalog";
import CartPanel from "./CartPanel";
import AttendeeSection from "./AttendeeSection";
import CheckoutDialog from "./CheckoutDialog";
import SizeGuideDialog from "./SizeGuideDialog";
import { useCart } from "../../hooks/useCart";
import { orderUnits } from "../../lib/cart";
import { baht } from "../../lib/format";
import { cx } from "../../lib/cx";
import { validateFields } from "../../lib/validators";
import { defaultPicks, SHIPPING_FEE } from "../../data/catalog";
import { fieldsForUnit } from "../../data/forms";
import s from "./shop.module.css";

const STEPS = ["เลือกสินค้า", "ข้อมูลการสั่งซื้อ", "ชำระเงิน"];

/**
 * หน้าซื้อบัตรและของที่ระลึก (ตัวควบคุมหลัก)
 * ขั้น 1 เลือกสินค้า -> ขั้น 2 กรอกข้อมูลรายชิ้น -> ขั้น 3 ชำระเงิน (popup)
 * ขั้น 2: บัตรทุกใบและของที่ระลึกทุกชิ้นมีการ์ดกรอกข้อมูลของตัวเอง (ของที่ระลึกติ๊กรับที่งาน/จัดส่งเพิ่ม)
 * บัตรกับของที่ระลึกเป็นสินค้าอิสระ ซื้อเสื้ออย่างเดียวโดยไม่ซื้อบัตรได้
 */
export default function ShopClient() {
  const router = useRouter();
  const cart = useCart();
  const [picked, setPicked] = useState(defaultPicks);
  const [step, setStep] = useState(1);
  const [attendees, setAttendees] = useState<AttendeesByUnit>({}); // ข้อมูลรายชิ้น { [unit.key]: { ...ช่องกรอก, method? } }
  const [errors, setErrors] = useState<UnitErrors>({}); // { [unit.key]: { [ชื่อช่อง | "method"]: ข้อความ } }
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const { lines, totals } = cart;
  const units = useMemo(() => orderUnits(lines), [lines]);
  const deliveryCount = units.filter(
    (u) => u.kind === "merch" && attendees[u.key]?.method === "delivery",
  ).length;
  const shipping = deliveryCount * SHIPPING_FEE; // ค่าจัดส่งคิดต่อชิ้นที่เลือกจัดส่ง

  const goStep = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };
  const back = () => (step === 2 ? goStep(1) : router.push("/"));

  /* ---------- แก้ไขข้อมูลรายชิ้น ---------- */
  const changeField = (key: string, field: FieldDefinition, raw: string) => {
    const value = field.sanitize ? field.sanitize(raw) : raw;
    const next = { ...(attendees[key] || {}), [field.name]: value };
    setAttendees((a) => ({ ...a, [key]: next }));
    if (errors[key]?.[field.name]) {
      setErrors((e) => ({
        ...e,
        [key]: { ...e[key], [field.name]: field.validate(value, next) },
      }));
    }
  };

  // ติ๊กรับที่งาน/จัดส่ง (ถ้าเปลี่ยนวิธี ล้างข้อความผิดของช่องที่อยู่ เพราะกติกาเปลี่ยน)
  const changeMethod = (key: string, method: DeliveryMethod) => {
    setAttendees((a) => ({ ...a, [key]: { ...(a[key] || {}), method } }));
    setErrors((e) => ({ ...e, [key]: { ...e[key], method: "", addr: "" } }));
  };

  /* ---------- ตรวจข้อมูลทุกช่องก่อนไปชำระเงิน ---------- */
  const submitDetails = () => {
    const found: UnitErrors = {};
    let firstId: string | null = null;
    for (const u of units) {
      const data = attendees[u.key] || {};
      const errs = validateFields(fieldsForUnit(u), data);
      if (u.kind === "merch" && !data.method)
        errs.method = "กรุณาติ๊กเลือกวิธีรับของชิ้นนี้";
      found[u.key] = errs;
      if (Object.keys(errs).length) {
        document.getElementById(`card-${u.key}`)?.setAttribute("open", ""); // เปิดการ์ดที่ยังไม่ครบ
        const badField = fieldsForUnit(u).find((f) => errs[f.name]);
        firstId ||= errs.method
          ? `${u.key}-pickup`
          : `${u.key}-${badField?.name ?? ""}`;
      }
    }
    setErrors(found);
    if (firstId) return document.getElementById(firstId)?.focus();
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setStep(lines.length ? 2 : 1);
  };
  const finishOrder = () => {
    cart.clear();
    setAttendees({});
    setErrors({});
  };

  return (
    <div className={s.root}>
      <Header current="shop">
        <CartPill count={totals.count} />
      </Header>

      <main className="wrap" id="top">
        <section className={s.pageHead}>
          <h1>เลือกซื้อบัตรและของที่ระลึก</h1>
          <Stepper steps={STEPS} current={checkoutOpen ? 3 : step} />
          <button
            type="button"
            className={s.back}
            onClick={back}
            aria-label={
              step === 2 ? "ย้อนกลับไปเลือกสินค้า" : "ย้อนกลับไปหน้าแรก"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            <span>ย้อนกลับ</span>
          </button>
          {step === 1 && (
            <p className={s.noteCard}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.5v.01" />
              </svg>
              <span>
                <b>ซื้อเฉพาะของที่ระลึกได้ ไม่ต้องซื้อบัตร</b>{" "}
                จะซื้อบัตรอย่างเดียว เสื้ออย่างเดียว
                หรือซื้อทั้งสองอย่างในคำสั่งซื้อเดียวกันก็ได้
              </span>
            </p>
          )}
        </section>

        {step === 1 ? (
          <div className={s.layout}>
            <ProductCatalog
              picked={picked}
              onPick={(id, option) =>
                setPicked((p) => ({ ...p, [id]: option }))
              }
              onAdd={(id) => cart.add(id, picked[id] || "")}
              onSizeGuide={() => setSizeOpen(true)}
            />
            <CartPanel
              lines={lines}
              totals={totals}
              onQty={cart.changeQty}
              onRemove={cart.remove}
              onCheckout={() => goStep(2)}
            />
          </div>
        ) : (
          <section className={s.attend} aria-label="ข้อมูลการสั่งซื้อ">
            <AttendeeSection
              units={units}
              attendees={attendees}
              errors={errors}
              onChange={changeField}
              onMethod={changeMethod}
            />
            <div className={s.attendActions}>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => goStep(1)}
              >
                กลับไปแก้ไขตะกร้า
              </button>
              <button className="btn" type="button" onClick={submitDetails}>
                ตรวจสอบและชำระเงิน
              </button>
            </div>
          </section>
        )}
      </main>

      {step === 1 && totals.count > 0 && (
        <div className={cx(s.mobilebar, s.hasItems)}>
          <div>
            ยอดรวม<b>{baht(totals.total)}</b>
          </div>
          <a className="btn btn-sm" href="#cart">
            ดูตะกร้า
          </a>
        </div>
      )}

      <SizeGuideDialog open={sizeOpen} onClose={() => setSizeOpen(false)} />
      <CheckoutDialog
        open={checkoutOpen}
        onClose={closeCheckout}
        lines={lines}
        totals={totals}
        units={units}
        attendees={attendees}
        shipping={shipping}
        onSuccess={finishOrder}
      />
    </div>
  );
}

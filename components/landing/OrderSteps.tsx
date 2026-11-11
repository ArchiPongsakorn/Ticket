import { cx } from "../../lib/cx";
import s from "./landing.module.css";

const STEPS = ["เลือกบัตรและของที่ระลึก", "ชำระเงินออนไลน์", "รับบัตรทางอีเมลทันที"];

export default function OrderSteps() {
  return (
    <ol className={cx(s.steps, s.reveal)} style={{ "--d": ".3s" }} aria-label="ขั้นตอนการสั่งซื้อ">
      {STEPS.map((text) => <li key={text}>{text}</li>)}
    </ol>
  );
}

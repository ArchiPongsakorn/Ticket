import { cx } from "../../lib/cx";
import s from "./shop.module.css";

/** ตัวบอกขั้นตอน 1-2-3 */
export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className={s.steps} aria-label="ขั้นตอนการสั่งซื้อ">
      {steps.map((name, i) => (
        <li key={name} className={cx(i + 1 === current && s.isCurrent, i + 1 < current && s.isDone)} aria-current={i + 1 === current ? "step" : undefined}>
          {name}
        </li>
      ))}
    </ol>
  );
}

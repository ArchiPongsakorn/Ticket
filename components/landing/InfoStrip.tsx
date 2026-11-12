import { EVENT } from "../../data/event";
import { cx } from "../../lib/cx";
import s from "./landing.module.css";

/** การ์ดข้อมูลงาน: วันที่จัดงานและสถานที่ ( */
export default function InfoStrip() {
  return (
    <section className={cx(s.info, s.reveal)} style={{ "--d": ".2s" }} aria-label="ข้อมูลงาน">
      <div><span className={s.label}>วันที่จัดงาน</span><span className={s.value}>{EVENT.dates}</span></div>
      <div><span className={s.label}>สถานที่</span><span className={s.value}>{EVENT.venue}</span></div>
    </section>
  );
}

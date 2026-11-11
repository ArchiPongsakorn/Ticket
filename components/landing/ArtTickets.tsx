import { cx } from "../../lib/cx";
import s from "./landing.module.css";

function Ticket({ variant, label, no }: { variant: string; label: string; no: string }) {
  return (
    <div className={cx(s.ticket, variant)}>
      <div className={s.ticketMain}>
        <small>{label}</small>
        <strong>งานเลี้ยงรุ่น CSI200</strong>
        <em>19 DEC 2026</em>
      </div>
      <div className={s.ticketStub}>{no}</div>
    </div>
  );
}

/** ภาพประกอบสไลด์บัตร: บัตร 2 ใบซ้อนกัน */
export default function ArtTickets() {
  return (
    <div className={s.art} aria-hidden="true">
      <div className={s.item}>
        <div className={s.stack}>
          <Ticket variant={s.ticketBack} label="VIP" no="No.0002" />
          <Ticket variant={s.ticketFront} label="STANDARD" no="No.0001" />
        </div>
      </div>
    </div>
  );
}

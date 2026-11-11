import Link from "next/link";
import s from "./auth.module.css";

export default function AuthSuccess({ title, text }: { title: string; text: string }) {
  return (
    <div className={s.done} role="status">
      <div className={s.doneIcon} aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="btn" href="/shop">เลือกซื้อบัตร</Link>
    </div>
  );
}

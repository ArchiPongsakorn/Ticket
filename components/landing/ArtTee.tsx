import s from "./landing.module.css";

/** ภาพประกอบสไลด์เสื้อ: เสื้อยืดเส้นเรียบบนแผ่นกลม */
export default function ArtTee() {
  return (
    <div className={s.art} aria-hidden="true">
      <div className={s.plate}>
        <svg viewBox="0 0 120 110">
          <path className={s.teePath} d="M32 18 50 8q10 12 20 0l18 10 14 24-16 8v52H34V50L18 42Z" />
        </svg>
      </div>
    </div>
  );
}

import s from "./auth.module.css";

/** คะแนนความแข็งแรงรหัสผ่าน 0-4 */
function strength(v: string) {
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
  return Math.max(1, score);
}

export default function PasswordMeter({ value }: { value: string }) {
  return (
    <div className={s.meter} data-level={strength(value)} aria-hidden="true">
      <i /><i /><i /><i />
    </div>
  );
}

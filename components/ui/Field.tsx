"use client";
import type { InputHTMLAttributes, ReactNode } from "react";
type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "children" | "value"> & { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; full?: boolean; children?: ReactNode };
import { useState } from "react";
import { cx } from "../../lib/cx";
import s from "./field.module.css";

/**
 * ช่องกรอกข้อมูลมาตรฐาน (ใช้ทั้งหน้า login และ shop)
 * - type="password" จะมีปุ่มแสดง/ซ่อนรหัสผ่านให้อัตโนมัติ
 * - children ใช้แทรกส่วนเสริมใต้ช่อง เช่น แถบวัดความแข็งแรงรหัสผ่าน
 */
export default function Field({ id, label, type = "text", value, onChange, onBlur, error, hint, full, children, ...inputProps }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx(s.field, full && s.full, error && s.invalid)}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div className={cx(s.control, isPassword && s.hasToggle)}>
        <input
          id={id}
          className={s.input}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e: import("react").ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {isPassword && (
          <button type="button" className={s.toggle} onClick={() => setShow((v) => !v)} aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
            {show ? "ซ่อน" : "แสดง"}
          </button>
        )}
      </div>
      {children}
      {hint && <p className={s.hint} id={`${id}-hint`}>{hint}</p>}
      {error && <p className={s.error} id={`${id}-err`}>{error}</p>}
    </div>
  );
}

import type { FieldDefinition, FieldErrors, FormValues } from "../types/domain";
/** ฟังก์ชันตรวจข้อมูล: คืนข้อความ error หรือ "" ถ้าผ่าน */

export const today = () => new Date().toISOString().slice(0, 10);

export const required = (v: string) => (v.trim() ? "" : "กรุณากรอกข้อมูลนี้");
export const minLen = (label: string, n = 2) => (v: string) => (v.trim().length >= n ? "" : `กรุณากรอก${label}`);
export const optional = () => "";

export const email = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "รูปแบบอีเมลไม่ถูกต้อง";

export const phone = (v: string) =>
  /^0\d{9}$/.test(v.replace(/[\s-]/g, "")) ? "" : "กรอกเบอร์โทร 10 หลัก เช่น 0812345678";

export const username = (v: string) =>
  /^[A-Za-z0-9_]{4,20}$/.test(v.trim()) ? "" : "ชื่อผู้ใช้ 4-20 ตัว ใช้ได้เฉพาะ a-z, 0-9 และ _";

/** ช่องเข้าสู่ระบบ: รับได้ทั้งชื่อผู้ใช้ อีเมล หรือเบอร์โทร */
export const identifier = (v: string) => {
  const x = v.trim();
  if (!x) return "กรุณากรอกชื่อผู้ใช้ อีเมล หรือเบอร์โทร";
  if (x.includes("@")) return email(x);
  return /^\d+$/.test(x) ? phone(x) : username(x);
};

export const password = (v: string) =>
  v.length >= 8 && /[A-Za-z\u0E00-\u0E7F]/.test(v) && /\d/.test(v) ? "" : "อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข";

export const confirmPassword = (v: string, values: FormValues) =>
  v && v === values.password ? "" : "รหัสผ่านไม่ตรงกัน";

export const zip = (v: string) => (/^\d{5}$/.test(v) ? "" : "กรอกรหัสไปรษณีย์ 5 หลัก");

export const birthDate = (v: string) =>
  !v ? "กรุณาเลือกวันเกิด" : v > today() || v < "1900-01-01" ? "วันเกิดไม่ถูกต้อง" : "";

/** ตรวจทุกช่องตามรายการ fields คืน { ชื่อช่อง: ข้อความ error } เฉพาะช่องที่ไม่ผ่าน */
export function validateFields(fields: FieldDefinition[], values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const f of fields) {
    const msg = f.validate(values[f.name] ?? "", values);
    if (msg) errors[f.name] = msg;
  }
  return errors;
}

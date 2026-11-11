import type { FieldDefinition, FormValues, OrderUnit, AuthMode, AuthDone } from "../types/domain";
import * as v from "../lib/validators";

const phoneChars = (s: string) => s.replace(/[^\d\s-]/g, "");

/* ---------- ผู้เข้างาน (ต่อบัตร 1 ใบ) ---------- */
export const ATTENDEE_FIELDS: FieldDefinition[] = [
  { name: "first", label: "ชื่อ", type: "text", validate: v.minLen("ชื่อ") },
  { name: "last", label: "นามสกุล", type: "text", validate: v.minLen("นามสกุล") },
  { name: "birth", label: "วันเกิด", type: "date", validate: v.birthDate },
  { name: "phone", label: "เบอร์โทร", type: "tel", inputMode: "numeric", sanitize: phoneChars, validate: v.phone },
  { name: "email", label: "อีเมลสำหรับรับบัตร", type: "email", full: true, validate: v.email },
];

/* ---------- ของที่ระลึก (ต่อ 1 ชิ้น) ----------
 * ฟอร์มคงที่ทั้งรับที่งานและจัดส่ง ช่องที่อยู่บังคับกรอกเฉพาะเมื่อเลือกจัดส่ง (values.method === "delivery") */
export const MERCH_FIELDS: FieldDefinition[] = [
  { name: "name", label: "ชื่อ-นามสกุล", type: "text", full: true, validate: v.minLen("ชื่อ-นามสกุล") },
  { name: "phone", label: "เบอร์โทร", type: "tel", inputMode: "numeric", sanitize: phoneChars, validate: v.phone },
  { name: "email", label: "อีเมล", type: "email", validate: v.email },
  {
    name: "addr", label: "ที่อยู่", type: "text", full: true,
    hint: "จำเป็นเฉพาะเมื่อเลือกจัดส่ง (รับที่งานไม่ต้องกรอก)",
    validate: (val, values) => (values.method === "delivery" ? v.minLen("ที่อยู่", 10)(val) : ""),
  },
];

/** ช่องที่ต้องกรอกของแต่ละรายการ (บัตร หรือ ของที่ระลึก) */
export const fieldsForUnit = (unit: OrderUnit): FieldDefinition[] => (unit.kind === "ticket" ? ATTENDEE_FIELDS : MERCH_FIELDS);

/* ---------- เข้าสู่ระบบ / สมัครสมาชิก ---------- */
export const AUTH_FORMS: Record<AuthMode, { title: string; sub: string; submit: string; fields: FieldDefinition[]; swap: { text: string; label: string; to: AuthMode }; done: AuthDone; terms?: boolean }> = {
  login: {
    title: "ยินดีต้อนรับกลับมา",
    sub: "เข้าสู่ระบบเพื่อดูบัตรและสั่งซื้อ",
    submit: "เข้าสู่ระบบ",
    fields: [
      { name: "id", label: "ชื่อผู้ใช้ อีเมล หรือเบอร์โทร", type: "text", autoComplete: "username", placeholder: "username หรือ name@email.com", validate: v.identifier },
      { name: "password", label: "รหัสผ่าน", type: "password", autoComplete: "current-password", validate: v.required },
    ],
    swap: { text: "ยังไม่มีบัญชี?", label: "สมัครสมาชิก", to: "register" },
    done: { title: "เข้าสู่ระบบสำเร็จ", text: "พร้อมเลือกซื้อบัตรและของที่ระลึกแล้ว" },
  },
  register: {
    title: "สร้างบัญชีใหม่",
    sub: "ใช้เวลาไม่ถึง 1 นาที",
    submit: "สมัครสมาชิก",
    terms: true,
    fields: [
      { name: "username", label: "ชื่อผู้ใช้ (username)", type: "text", autoComplete: "username", placeholder: "เช่น moon_fan", hint: "4-20 ตัว ใช้ตัวอักษรอังกฤษ ตัวเลข หรือ _", validate: v.username },
      { name: "email", label: "อีเมล", type: "email", autoComplete: "email", placeholder: "name@email.com", hint: "ใช้รับบัตรอิเล็กทรอนิกส์", validate: v.email },
      { name: "phone", label: "เบอร์โทร", type: "tel", autoComplete: "tel", inputMode: "numeric", placeholder: "08XXXXXXXX", sanitize: phoneChars, validate: v.phone },
      { name: "password", label: "รหัสผ่าน", type: "password", autoComplete: "new-password", hint: "อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข", meter: true, validate: v.password },
      { name: "confirm", label: "ยืนยันรหัสผ่าน", type: "password", autoComplete: "new-password", validate: v.confirmPassword },
    ],
    swap: { text: "มีบัญชีอยู่แล้ว?", label: "เข้าสู่ระบบ", to: "login" },
    done: { title: "สมัครสมาชิกสำเร็จ", text: "เราส่งอีเมลยืนยันไปให้แล้ว ตรวจสอบกล่องจดหมายของคุณได้เลย" },
  },
};


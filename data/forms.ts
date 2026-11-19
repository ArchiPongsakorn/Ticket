import type {
  FieldDefinition,
  FormValues,
  OrderUnit,
  AuthMode,
} from "../types/domain";
import * as v from "../lib/validators";

const phoneChars = (s: string) => s.replace(/[^\d\s-]/g, "");

/* ---------- ผู้เข้างาน (ต่อบัตร 1 ใบ) ---------- */
export const ATTENDEE_FIELDS: FieldDefinition[] = [
  { name: "first", label: "ชื่อ", type: "text", validate: v.minLen("ชื่อ") },
  {
    name: "last",
    label: "นามสกุล",
    type: "text",
    validate: v.minLen("นามสกุล"),
  },
  {
    name: "email",
    label: "อีเมลสำหรับรับบัตร",
    type: "email",
    validate: v.email,
  },
];

/* ---------- ของที่ระลึก (ต่อ 1 ชิ้น) ----------
 * ฟอร์มคงที่ทั้งรับที่งานและจัดส่ง ช่องที่อยู่บังคับกรอกเฉพาะเมื่อเลือกจัดส่ง (values.method === "delivery") */
export const MERCH_FIELDS: FieldDefinition[] = [
  {
    name: "name",
    label: "ชื่อ-นามสกุล",
    type: "text",
    full: true,
    validate: v.minLen("ชื่อ-นามสกุล"),
  },
  { name: "email", label: "อีเมล", type: "email", validate: v.email },
  {
    name: "addr",
    label: "ที่อยู่",
    type: "text",
    full: true,
    hint: "จำเป็นเฉพาะเมื่อเลือกจัดส่ง (รับที่งานไม่ต้องกรอก)",
    //check value = deli 
    validate: (val, values) =>
      values.method === "delivery" ? v.minLen("ที่อยู่", 10)(val) : "",
  },
];

/** ช่องที่ต้องกรอกของแต่ละรายการ (บัตร หรือ ของที่ระลึก) */
//Ticket = ATTENDEE
//T = MERCH
export const fieldsForUnit = (unit: OrderUnit): FieldDefinition[] =>
  unit.kind === "ticket" ? ATTENDEE_FIELDS : MERCH_FIELDS;

/* ---------- เข้าสู่ระบบ / สมัครสมาชิก ---------- */
export const AUTH_FORMS: Record<
  AuthMode,
  {
    title: string;
    sub: string;
    submit: string;
    fields: FieldDefinition[];
    swap: { text: string; label: string; to: AuthMode };
    terms?: boolean;
  }
> = {
  login: {
    title: "ยินดีต้อนรับกลับมา",
    sub: "เข้าสู่ระบบเพื่อดูบัตรและสั่งซื้อ",
    submit: "เข้าสู่ระบบ",
    fields: [
      {
        name: "id",
        label: "ชื่อผู้ใช้ หรือ อีเมล ",
        type: "text",
        autoComplete: "username",
        placeholder: "username หรือ email",
        validate: v.identifier,
      },
      {
        name: "password",
        label: "รหัสผ่าน",
        type: "password",
        autoComplete: "current-password",
        placeholder: "กรอกรหัสผ่าน",
        validate: v.required,
      },
    ],
    swap: { text: "ยังไม่มีบัญชี?", label: "สมัครสมาชิก", to: "register" },
  },
  register: {
    title: "สร้างบัญชีใหม่",
    sub: "สมัครสมาชิกทั่วไป (User) และเก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนี้",
    submit: "สมัครสมาชิก",
    fields: [
      {
        name: "username",
        label: "ชื่อผู้ใช้ (username)",
        type: "text",
        autoComplete: "username",
        placeholder: "เช่น username",
        validate: v.username,
      },
      {
        name: "email",
        label: "อีเมล",
        type: "email",
        autoComplete: "email",
        placeholder: "กรอกอีเมล",
        validate: v.email,
      },
      {
        name: "password",
        label: "รหัสผ่าน",
        type: "password",
        autoComplete: "new-password",
        placeholder: "กรอกรหัสผ่าน",
        hint: "อย่างน้อย 4 ตัว ",
        validate: v.password,
      },
      {
        name: "confirm",
        label: "ยืนยันรหัสผ่าน",
        type: "password",
        autoComplete: "new-password",
        placeholder: "ยืนยันรหัสผ่าน",
        validate: v.confirmPassword,
      },
    ],
    swap: { text: "มีบัญชีอยู่แล้ว?", label: "เข้าสู่ระบบ", to: "login" },
  },
};

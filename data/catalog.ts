import type { Product } from "../types/domain";
/** ข้อมูลสินค้าทั้งหมด แก้ชื่อ ราคา และ token ที่ไฟล์นี้ */

export const SHIPPING_FEE = 60; // ค่าจัดส่งต่อชิ้น (บาท) คิดเฉพาะชิ้นที่เลือก "จัดส่งถึงบ้าน"

export const GROUPS = [
  {
    type: "ticket",
    title: "บัตรเข้างาน",
    sub: "19 ธ.ค. 2569 | บัตร Premium และ Vip มี token โบนัส ใช้ซื้ออาหาร เครื่องดื่ม และของในงาน",
  },
  { type: "merch", title: "ของที่ระลึก", sub: "ซื้อแยกได้โดยไม่ต้องมีบัตรเข้างาน" },
];

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

export const CATALOG: Product[] = [
  { id: "std", type: "ticket", name: "บัตร Standard", desc: "เข้างานได้เลย !",
    perks: ["เข้างานได้เลย"], price: 490, was: 590, tokens: 0, glyph: "STD", max: 6 },
  { id: "plus", type: "ticket", name: "บัตร Premium", desc: "เข้างานพร้อมโบนัส token",
    perks: ["เข้างานได้เลย", "โบนัส token ใช้ซื้อของในงาน"], price: 750, tokens: 300, glyph: "PLUS", max: 6 },
  { id: "premium", type: "ticket", name: "บัตร Premium", desc: "token โบนัสมากที่สุด",
    perks: ["เข้างานได้เลย", "โบนัส token มากที่สุด", ], price: 1000, tokens: 600, glyph: "PRM", max: 6 },
  { id: "tee", type: "merch", name: "เสื้อยืดประจำงาน", desc: "ผ้าคอตตอน 100% สกรีนโลโก้",
    price: 690, glyph: "TEE", max: 10, optionLabel: "ไซซ์", options: SIZES, sizeGuide: true },
  // { id: "hood", type: "merch", name: "xxx", desc: "title",
  //   price: 0, glyph: "tee", max: 10, optionLabel: "ไซซ์", options: SIZES, sizeGuide: true },
  // { id: "tote", type: "merch", name: "xxx", desc: "title",
  //   price: 0, glyph: "tee", max: 10 },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(CATALOG.map((p) => [p.id, p]));

/** ไซซ์ตั้งต้น: เสื้อเป็น M ส่วนอื่นเป็นตัวเลือกแรก */
export const defaultPicks = (): Record<string, string> =>
  Object.fromEntries(
    CATALOG.filter((p) => p.options?.length).map((p) => [p.id, p.type === "merch" ? (p.options?.[1] ?? "") : (p.options?.[0] ?? "")])
  );

/** ตารางไซซ์ [ไซซ์, รอบอก (นิ้ว), ความยาว (นิ้ว)] */
export const SIZE_CHART: Array<[string, number, number]> = [
  ["S", 36, 26], ["M", 38, 27], ["L", 40, 28], ["XL", 42, 29],
  ["2XL", 44, 30], ["3XL", 46, 31], ["4XL", 48, 32],
];

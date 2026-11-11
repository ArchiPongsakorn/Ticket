import type { FormValues } from "../types/domain";
/**
 * จุดเชื่อมต่อระบบหลังบ้าน (ตอนนี้เป็นตัวจำลอง)
 * เปลี่ยนเนื้อในฟังก์ชันให้เรียก API จริง เช่น fetch("/api/login", { method: "POST", body: ... })
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(payload: FormValues) {
  await wait(900);
  return { ok: true, user: { id: payload.id } };
}

export async function register(payload: FormValues) {
  await wait(900);
  return { ok: true };
}

export async function createOrder(order: Record<string, unknown>) {
  await wait(700);
  const orderNo = "MF" + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
  return { ok: true, orderNo };
}

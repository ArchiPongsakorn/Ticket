# Nextpro + AdminUI — Full TypeScript Migration

ใช้ **nextpro เป็นฐานหลัก** และคง routes ของเว็บไซต์ `/`, `/login`, `/shop` กับ Dashboard `/admin` ไว้

## สิ่งที่แปลงแล้ว
- `app/(site)/*.jsx` และ `components/**/*.jsx` ของ nextpro -> `.tsx`
- `hooks/*.js`, `lib/*.js`, `data/*.js` -> `.ts`
- เพิ่ม `types/domain.ts`: Product, CartLine, CartTotals, OrderUnit, FormValues, AuthMode, CheckoutResult ฯลฯ
- เพิ่ม Type ให้ React props, Hooks, state, ฟอร์ม, สินค้าและตะกร้า
- เปิด `strict: true` ใน tsconfig.json, ปิด `allowJs`
- AdminUI ต้นฉบับซึ่งเป็น TSX อยู่แล้ว ยังคงไว้ ไม่ได้เปลี่ยน UI หรือเขียนใหม่

## คำสั่งใช้งาน
ติดตั้ง Node.js รุ่นที่ Next.js กำหนด จากนั้น:

```bash
npm install
npm run verify
npm run check:domain
npm run typecheck
npm run build
npm run dev
```

`npm run check:domain` ตรวจ TypeScript แบบ strict สำหรับไฟล์ data/lib และ shared domain types อย่างเป็นอิสระ

## สิ่งที่ตรวจสอบได้จริงในสภาพแวดล้อมสร้างไฟล์
- Routes `/`, `/login`, `/shop`, `/admin` และ Imports ภายใน: **ผ่าน** (`npm run verify`)
- Syntax/Transpile ของ TypeScript/TSX จำนวน 51 ไฟล์: **ผ่าน**
- Strict TypeScript ใน `data/`, `lib/`, `types/`: **ผ่าน**
- Smoke tests ของ catalog, cart, orderUnits, default size, form validation: **ผ่าน**
- `npm run typecheck`, `npm run build` และการทดสอบหน้าเว็บผ่านเบราว์เซอร์: **ยังไม่ผ่านการยืนยัน** เพราะสภาพแวดล้อมนี้ดาวน์โหลด Dependencies จาก npm ไม่ได้

## สถานะระบบธุรกิจเดิม
- `lib/api.ts` ยังเป็น API จำลอง; ฟังก์ชัน login/register/createOrder **ไม่ได้เชื่อมฐานข้อมูลจริง**
- `/admin` ใน Production ใช้ HTTP Basic Auth ของ `proxy.ts`; ตั้ง ADMIN_BASIC_USER และ ADMIN_BASIC_PASSWORD ด้วยค่าเฉพาะใน server environment ก่อน Deploy
- AdminUI ต้นฉบับมี Dashboard และ CheckSlip; เมนูอื่นบางส่วนยังเป็น UI placeholder ไม่ใช่ CRUD ที่เชื่อม backend
- ต้องตรวจสอบ Tailwind CSS และการแสดงผลในเครื่องที่ติดตั้ง Dependencies ได้ก่อน Deploy จริง

## แนวทางต่อไป
1. รัน `npm install && npm run typecheck && npm run build` บนเครื่อง
2. แก้ Type Errors/Build Errors ที่อาจเหลือจาก library typings ที่ยังตรวจไม่ได้
3. จากนั้นค่อยเชื่อม Auth, Database และ API ของเว็บ/แดชบอร์ดจริง โดยยึด `types/domain.ts` เป็นจุดกลาง

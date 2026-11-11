

เว็บขายบัตรและของที่ระลึกงาน

| หน้า | เส้นทาง | ไฟล์ |
|---|---|---|
| หน้าแรก (loading / welcome) | `/` | `src/app/page.jsx` |
| เข้าสู่ระบบ / สมัครสมาชิก | `/login` และ `/login?tab=register` | `src/app/login/page.jsx` |
| เลือกซื้อบัตรและของที่ระลึก | `/shop` | `src/app/shop/page.jsx` |

## วิธีรัน

ต้องมี Node.js 18.18 ขึ้นไป (แนะนำ 20)

```bash
npm install
npm run dev        # เปิด http://localhost:3000
```

สร้างไฟล์สำหรับ deploy

```bash
npm run build
npm run start
```

> ต้องต่ออินเทอร์เน็ตตอน `npm run build` เพราะดึงฟอนต์ Kanit / Noto Sans Thai จาก Google Fonts ผ่าน `next/font`

## วิธีนำไปใส่ในโปรเจกต์ Next.js ที่สร้างไว้แล้ว (ไม่ต้องลบไฟล์เดิม)

ใช้ได้กับโปรเจกต์ที่สร้างด้วย `npx create-next-app@latest` ทั้งแบบ TypeScript และ JavaScript และทั้งแบบมีและไม่มีโฟลเดอร์ `src/` (โค้ดใช้ import แบบ relative ไม่พึ่ง alias `@/` จึงไม่ต้องแก้ `tsconfig.json` หรือ `jsconfig.json`)

1. แตกไฟล์ zip แล้วคัดลอกโฟลเดอร์ทั้ง 5 ที่อยู่ใน `src` (**`app`, `components`, `data`, `hooks`, `lib`**) ไปวางในที่เดียวกับโฟลเดอร์ `app` ของโปรเจกต์ ถ้าโปรเจกต์มีโฟลเดอร์ `src` ให้วางใน `src/` ถ้าไม่มี (มี `app` อยู่ที่รากโปรเจกต์) ให้วางที่รากโปรเจกต์ เลือก Replace / Merge ไฟล์ที่ชื่อซ้ำ (`globals.css`) จะถูกแทนที่ ส่วนไฟล์เดิมอื่นๆ (`page.tsx`, `layout.tsx`, `favicon.ico`) ไม่ต้องลบ
2. เปิดไฟล์ `next.config.ts` (หรือ `next.config.mjs` / `next.config.js` ถ้าเป็น JavaScript) ของโปรเจกต์ แล้ว **แทนที่เนื้อหาทั้งหมด** ด้วยโค้ดนี้
   - โปรเจกต์ TypeScript: ใช้ไฟล์ `config-variants/next.config.ts`
   - โปรเจกต์ JavaScript: ใช้ไฟล์ `next.config.mjs`
3. ลบโฟลเดอร์ `.next` แล้วรัน `npm run dev` ใหม่

ทำไมไม่ต้องลบไฟล์เดิม: ค่า `pageExtensions: ["jsx"]` บอก Next.js ให้ใช้เฉพาะไฟล์ `.jsx` เป็นหน้าเว็บ ไฟล์เริ่มต้น `page.tsx` / `layout.tsx` จึงถูกเมินและไม่ชนกับ `page.jsx` / `layout.jsx` ของโปรเจกต์นี้

ทำไมต้องแทนที่ config: config เริ่มต้นของ create-next-app (Next 16 + Tailwind) ส่งไฟล์ `.css` ทุกไฟล์ผ่านตัวประมวลผลของ Tailwind ซึ่งทำให้ไฟล์ `.module.css` กลายเป็น CSS ธรรมดา คลาสจะว่างเปล่าและหน้าเว็บเลย์เอาต์พัง

ข้อควรรู้
- ไฟล์ของโปรเจกต์นี้ต้องเป็น `.jsx` สำหรับหน้า/เลย์เอาต์เสมอ (`page.jsx`, `layout.jsx`) ถ้าเพิ่มหน้าใหม่ ให้ตั้งชื่อ `page.jsx`

## ธีม

โทนกรมท่าเข้มและสีเน้นฟ้าสว่าง สีหลักทั้งหมดอยู่ใน `src/app/globals.css` ส่วน TOKENS (`--bg`, `--surface`, `--text`, `--accent` ฯลฯ) แก้ที่ชุดนี้เพื่อเปลี่ยนโทนทั้งเว็บ ส่วนสีเสริมของภาพประกอบหน้าแรกอยู่ใน `components/landing/landing.module.css`

## โครงสร้างไฟล์

```
src/
├─ app/                      หน้าเว็บ (1 โฟลเดอร์ = 1 เส้นทาง)
│  ├─ layout.jsx             โครงหลัก, โหลดฟอนต์, metadata
│  ├─ globals.css            สี/ฟอนต์กลาง (tokens), base, ปุ่ม .btn ใช้ร่วมทุกหน้า
│  ├─ page.jsx               หน้าแรก
│  ├─ login/page.jsx         หน้า login/register
│  └─ shop/page.jsx          หน้าซื้อบัตร
├─ components/
│  ├─ layout/Header.jsx      แถบเมนูบนสุด (ใช้ร่วมทุกหน้า)
│  ├─ ui/                    ชิ้นส่วนใช้ซ้ำ: Field (ช่องกรอก), Modal (popup)
│  ├─ landing/               ส่วนของหน้าแรก: แบนเนอร์, ภาพบัตร/เสื้อ, การ์ดข้อมูลงาน
│  ├─ auth/                  ส่วนของหน้า login: การ์ดแท็บ, ฟอร์ม, วัดความแข็งแรงรหัสผ่าน
│  └─ shop/                  ส่วนของหน้าซื้อ: ShopClient (ตัวควบคุม), สินค้า, ตะกร้า, ฟอร์มผู้เข้างาน, ฟอร์มรับของ, ชำระเงิน
├─ data/                     ข้อมูลที่แก้บ่อย (แยกจากโค้ด)
│  ├─ catalog.js             สินค้า ราคา token ไซซ์ ค่าจัดส่ง
│  ├─ forms.js               ช่องกรอกและกติกาตรวจข้อมูลของทุกฟอร์ม
│  └─ event.js               ชื่องาน วันที่ สถานที่ เวลาสิ้นสุด Early Bird
├─ hooks/                    ตรรกะที่ใช้ซ้ำ (useCart, useCarousel, usePersistentState)
└─ lib/                      ฟังก์ชันช่วย (validators, format, cart, storage, api)
```

แต่ละคอมโพเนนต์มีไฟล์ `.module.css` ของตัวเอง (CSS Modules) ชื่อคลาสจึงไม่ชนกันข้ามหน้า

## แก้อะไรที่ไหน

| อยากแก้ | ไฟล์ |
|---|---|
| ชื่อบัตร ราคา จำนวน token โบนัส ไซซ์ ค่าจัดส่ง | `src/data/catalog.js` |
| ค่าจัดส่งของที่ระลึก | `src/data/catalog.js` (`SHIPPING_FEE` คิดต่อชิ้นที่เลือกจัดส่ง) |
| ชื่องาน วันที่ สถานที่ | `src/data/event.js` |
| ช่องกรอกและข้อความ error ของฟอร์ม | `src/data/forms.js`, `src/lib/validators.js` |
| ข้อความและสไลด์แบนเนอร์หน้าแรก | `src/components/landing/HeroCarousel.jsx` |
| สีและฟอนต์ทั้งเว็บ | `src/app/globals.css` (ส่วน TOKENS) |
| ลิงก์เมนู | `src/components/layout/Header.jsx` |

## เชื่อมระบบหลังบ้าน

ตอนนี้ login, สมัครสมาชิก และสั่งซื้อเป็นตัวจำลอง ให้แก้ที่ `src/lib/api.js` ให้เรียก API จริง

- `login(payload)` และ `register(payload)` ถูกเรียกจาก `components/auth/AuthForm.jsx`
- `createOrder(order)` ถูกเรียกจาก `components/shop/CheckoutDialog.jsx` ได้รับรายการสินค้า ข้อมูลผู้เข้างานของบัตรแต่ละใบ ข้อมูลรับของ วิธีชำระเงิน และยอดรวม

## ข้อมูลที่เก็บในเครื่องผู้ใช้ (localStorage)

- ตะกร้าสินค้า (`ticket-cart`)
- ข้อมูลรายชิ้นที่กรอก (ผู้ถือบัตรและผู้รับของที่ระลึก) เก็บในหน่วยความจำของหน้าเท่านั้น ไม่บันทึกลงเครื่อง

ถ้าต้องการให้ข้อมูลผูกกับบัญชีสมาชิก ต้องบันทึกที่เซิร์ฟเวอร์ผ่านระบบหลังบ้าน

## ที่ยังเป็นตัวอย่าง (ต้องแก้ก่อนใช้จริง)

- ลิงก์ "ลืมรหัสผ่าน", "เงื่อนไขการใช้งาน", "นโยบายความเป็นส่วนตัว" ชี้ไป `/login` ชั่วคราว
- ปุ่ม "รายละเอียด" ในแบนเนอร์ชี้ไป `/shop` ชั่วคราว
- ราคา ชื่อระดับบัตร จำนวน token วันที่ และสถานที่เป็นข้อมูลสมมติ
- ไม่มีระบบสต็อกสินค้าและระบบชำระเงินจริง

## Deploy

วิธีง่ายที่สุดคือ [Vercel](https://vercel.com): อัปโหลดโปรเจกต์ขึ้น GitHub แล้ว Import ที่ Vercel ไม่ต้องตั้งค่าเพิ่ม

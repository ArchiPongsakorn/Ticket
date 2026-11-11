# Nextpro + AdminUI: รายงานตรวจและวิธีรัน

## สถานะ
- ใช้ nextpro เป็นต้นฉบับหลัก โดยย้าย route เว็บไป `app/(site)` และแก้ import ให้ใช้ `@/` ที่ชี้ root
- เพิ่ม UI จาก adminui (ต้นทาง) ใน `app/(admin)/admin` และ `components/admin`
- แยก CSS/Layout ด้วย route groups; ใช้ Next.js + Tailwind v4 PostCSS (ไม่ใช้ turbopack CSS custom loader)
- มี `proxy.ts` ป้องกัน `/admin`: **production ต้องตั้ง ADMIN_BASIC_USER และ ADMIN_BASIC_PASSWORD มิฉะนั้นตอบ 503**, development ที่ไม่ได้ตั้งค่าจะเปิด Dashboard ได้เพื่อทดสอบ
- ระบบหน้าเว็บ `lib/api.js` ยังเป็นข้อมูลจำลอง ไม่ใช่ระบบฐานข้อมูล/ล็อกอินจริง
- ต้นทาง Admin มีหน้าคอนเทนต์ Dashboard และ CheckSlip ว่าง และเมนูอื่นยังไม่ได้พัฒนาให้ทำงานจริง; การรวมไม่ได้เพิ่มฟังก์ชัน Backend เหล่านั้น

## การเริ่มต้น
1. สร้าง `.env.local` (ดู `.env.example`) และตั้งชื่อผู้ใช้/รหัสผ่าน Admin ที่แข็งแรง
2. `npm install`
3. `npm run verify`
4. `npm run typecheck`
5. `npm run build`
6. `npm run dev` แล้วเข้า `/`, `/login`, `/shop`, `/admin`

**อย่าเผยแพร่ Basic Auth บน HTTP** ให้ใช้ HTTPS และสร้างระบบ Login + Role-based permissions จริงก่อนใช้ฟังก์ชัน Admin ที่เปลี่ยนข้อมูลสำคัญ

## สิ่งที่ตรวจได้ / ยังตรวจไม่ได้
- ตรวจ Route, import ที่ชี้ไฟล์ท้องถิ่น และความครบของโครงสร้าง ด้วย `npm run verify`
- ยังไม่ได้ยืนยัน npm install / Next.js build ในสภาพแวดล้อมนี้ เนื่องจากเชื่อมต่อ npm registry ไม่ได้ (`EAI_AGAIN`)
- ไม่อาจอ้างว่าระบบ Backend, Database, Payment, Admin Login ใช้งานจริง เพราะโปรเจกต์ต้นทางไม่ได้ให้ระบบครบ

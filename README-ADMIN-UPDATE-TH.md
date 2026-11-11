# Nextpro (Base) + AdminUI Latest — ก่อนเพิ่ม Mock Login

โปรเจกต์นี้ใช้ **nextpro-adminui-full-typescript** เป็นฐาน (ไม่ใช่เวอร์ชัน Mock Login) แล้วอัปเดตเฉพาะโค้ดของ **adminui-main(1).zip**

## สิ่งที่รวมแล้ว
- คงหน้า `/`, `/login`, `/shop` ของ nextpro (Full TypeScript)
- เพิ่ม Dashboard ใหม่, กราฟ ApexCharts, หน้า Users, Stores, Report, Audit Log จาก AdminUI ล่าสุดที่ `/admin`
- คง Check Slip เดิมของโปรเจกต์รวมก่อนหน้า ไม่ใช้ BlankPage แทน
- คงเมนูที่ยังไม่พัฒนาไว้เป็น Placeholder ตาม upstream
- ย้ายข้อมูล Admin จำลองไปที่ `data/admin/dashboard.json`
- ปรับ import aliases ของ components/tailgrids และเพิ่ม `apexcharts`, `react-apexcharts`
- เก็บ proxy.ts ป้องกัน /admin สำหรับ production ด้วย env credentials
- **ไม่ได้เพิ่มหรือแก้ Mock Login**; login ฝั่งเว็บยังเป็นตัวอย่างเดิม

## ทดสอบบนคอมพิวเตอร์ที่ติดตั้ง Node.js
```bash
npm install
npm run verify
npm run check:domain
npm run typecheck
npm run build
npm run dev
```

## ตั้งค่า Admin Access
อ้างอิง `.env.example` สำหรับ `ADMIN_BASIC_USER` และ `ADMIN_BASIC_PASSWORD` ก่อน deploy production

## ข้อจำกัด
- ไฟล์นี้รวมซอร์สจริงและตรวจ static imports / routes; ยังไม่ยืนยัน Build จนกว่าจะติดตั้ง dependencies และรันคำสั่งข้างบนผ่าน
- หน้า AdminUI ใหม่ส่วนใหญ่แสดง mock JSON และปุ่มบางปุ่มยังไม่มี action
- หน้า Check Slip เดิมเป็น UI/placeholder ไม่ใช่ระบบตรวจสลิปจริง
- Basic Authentication แยกจาก role/session login; ไม่เหมาะใช้แทนระบบสิทธิ์จริง
- อย่าเปิด production ก่อนทำ Auth, API และ DB จริง

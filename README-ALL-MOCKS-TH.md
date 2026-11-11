# Nextpro + AdminUI ใหม่ + Mock Login (รวมครบ)

## แหล่งไฟล์
- ฐาน: `nextpro-adminui-admin-updated-pre-mock` (Nextpro Full TypeScript + AdminUI เวอร์ชันล่าสุด)
- นำ Mock Login จาก `nextpro-adminui-mock-login` กลับมา โดย **ไม่ทับ** หน้า Dashboard และข้อมูล Mock ใหม่
- Admin Mock Data: `data/admin/dashboard.json` (ย้ายมาจาก AdminUI ล่าสุดตามเวอร์ชันฐาน)

## Demo Flow
- `/login`: เลือก `user / user1234` แล้วเข้าสู่ `/shop`
- `/login`: เลือก `admin / admin1234` แล้วเข้าสู่ `/admin`
- `/admin`: Dashboard, User Management, Store Management, Report, Audit Log และ Check Slip เดิม
- User / Admin สามารถกดปุ่มออกจากระบบในแถบ Demo ได้

## ติดตั้งและตรวจสอบ
```sh
npm install
npm run verify
npm run check:domain
npm run typecheck
npm run build
npm run dev
```

## ข้อควรระวัง
Mock Login นี้เก็บสถานะไว้ใน localStorage และฝังรหัสผ่านตัวอย่างไว้ใน Client Code ไม่ใช่ Authentication จริง ห้ามนำไปป้องกันข้อมูลสำคัญหรือเปิดขายจริงโดยอาศัย Role Check นี้เพียงอย่างเดียว

ไฟล์ `proxy.ts` เดิมยังคงใช้ HTTP Basic Auth ป้องกัน `/admin` ใน Production หากตั้ง `ADMIN_BASIC_USER` และ `ADMIN_BASIC_PASSWORD` (กรณีไม่ได้ตั้ง ใน Production จะตอบ 503) ทำให้การสาธิต Admin บน Production ต้องผ่าน Basic Auth ก่อน ส่วน `npm run dev` จะใช้ Mock Login ได้

ข้อมูลสถิติ/ตาราง Dashboard ยังเป็นข้อมูลจำลองจาก JSON และยังไม่เชื่อม Backend จริง หน้า Admin บางเมนูยังเป็น Placeholder ตามต้นฉบับล่าสุด

ผลตรวจที่ยืนยันได้จากการจัดแพ็ก: เช็ก Route และ Internal Imports ด้วย `npm run verify` และตรวจว่ามี Mock JSON กับ Components ที่จำเป็นครบ การตรวจ Build เต็มต้องติดตั้ง Dependencies และรัน `npm run build` สำเร็จ

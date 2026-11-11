import s from "./auth.module.css";

const PERKS = [
  "เก็บบัตรทุกใบไว้ในบัญชีเดียว",
  "ได้สิทธิ์ซื้อบัตร Early Bird ก่อนใคร",
  "ซื้อซ้ำได้ทันที ไม่ต้องกรอกข้อมูลใหม่",
];

/** ข้อความต้อนรับฝั่งซ้ายของหน้า login */
export default function AuthIntro() {
  return (
    <section className={s.intro} aria-labelledby="introTitle">
      <h1 id="introTitle">เข้าสู่ระบบเพื่อซื้อบัตรได้เร็วขึ้น</h1>
      <p>สมัครครั้งเดียว ใช้ได้ทั้งบัตรเข้างานและของที่ระลึก</p>
      <ul className={s.perks}>
        {PERKS.map((text) => <li key={text}>{text}</li>)}
      </ul>
    </section>
  );
}

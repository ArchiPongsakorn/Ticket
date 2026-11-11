"use client";
import Modal from "../ui/Modal";
import { SIZE_CHART } from "../../data/catalog";
import s from "./shop.module.css";

export default function SizeGuideDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="sizeTitle">
      <div className={s.dlg}>
        <h2 id="sizeTitle">ตารางไซซ์เสื้อ</h2>
        <table className={s.sizeTable}>
          <thead><tr><th>ไซซ์</th><th>รอบอก (นิ้ว)</th><th>ความยาว (นิ้ว)</th></tr></thead>
          <tbody>
            {SIZE_CHART.map(([size, chest, length]) => (
              <tr key={size}><td>{size}</td><td>{chest}</td><td>{length}</td></tr>
            ))}
          </tbody>
        </table>
        <p className={s.hint}>ถ้าต้องการไซซ์ใหญ่กว่า 4XL ให้ระบุไซซ์ที่ต้องการในช่องหมายเหตุตอนกรอกข้อมูลรับของ</p>
        <button className="btn btn-block" type="button" onClick={onClose}>ปิด</button>
      </div>
    </Modal>
  );
}

"use client";
import { useEffect, useRef } from "react";
import s from "./modal.module.css";

/** หน้าต่าง popup แบบ <dialog> ของเบราว์เซอร์ (กด Esc ปิดได้ โฟกัสถูกล็อกในหน้าต่างให้อัตโนมัติ) */
export default function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: import("react").ReactNode }) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={s.modal} aria-labelledby={labelledBy} onClose={() => open && onClose()}>
      {open ? children : null}
    </dialog>
  );
}

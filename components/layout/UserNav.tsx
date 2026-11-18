"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ScrollText, SquareArrowRightEnter, Store, User } from "lucide-react";
import s from "./UserNav.module.css";

/** Account data shown in the site header. */
export type UserNavAccount = {
  username: string;
  label?: string;
};

type UserNavProps = {
  user?: UserNavAccount | null;
  onLogout?: () => void;
};

/** Presentation-only navigation. Parent supplies the LocalStorage session. */
export default function UserNav({ user = null, onLogout }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  if (!user) {
    if (pathname === "/login") return null;
    return (
      <Link className="btn btn-ghost btn-sm" href="/login">
        เข้าสู่ระบบ
      </Link>
    );
  }

  const username = user.username;
  const initial = username.trim().charAt(0).toUpperCase() || "U";
  const label = user.label ?? "สมาชิกทั่วไป";

  return (
    <div className={s.root} ref={rootRef}>
      <button
        type="button"
        className={s.trigger}
        aria-label={`เมนูโปรไฟล์ ${username}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((old) => !old)}
      >
        <span className={s.avatar} aria-hidden="true">{initial}</span>
        <span className={s.identity}>
          <span className={s.name}>{username}</span>
          <span className={s.role}>{label}</span>
        </span>
        <svg
          className={`${s.chevron} ${open ? s.rotated : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={s.menu} role="menu" aria-label="เมนูบัญชีผู้ใช้">
          <div className={s.menuAccount}>
            <span className={s.largeAvatar} aria-hidden="true">{initial}</span>
            <div className={s.menuIdentity}>
              <strong>{username}</strong>
              <span>{label}</span>
            </div>
          </div>

          <div className={s.divider} />
          <Link href="/" className={s.menuItem} onClick={() => setOpen(false)}>
            <House size={18} />
            <span>หน้าแรก</span>
          </Link>
          <Link href="/shop" className={s.menuItem} onClick={() => setOpen(false)}>
            <Store size={18} />
            <span>เลือกซื้อบัตร</span>
          </Link>
          <Link href="/my-orders" className={s.menuItem} onClick={() => setOpen(false)}>
            <ScrollText size={18} />
            <span>คำสั่งซื้อของฉัน</span>
          </Link>
          <Link href="/profile" className={s.menuItem} onClick={() => setOpen(false)}>
            <User size={18} />
            <span>ข้อมูลส่วนตัว</span>
          </Link>

          {onLogout && (
            <>
              <div className={s.divider} />
              <button
                className={`${s.menuItem} ${s.logout}`}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
              >
                <SquareArrowRightEnter size={18} />
                <span>ออกจากระบบ</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { demoLogout, getDemoSession, type DemoSession } from "@/lib/mock-auth";
import s from "./UserNav.module.css";
import { House } from "lucide-react";
import { Store } from "lucide-react";
import { ScrollText } from "lucide-react";
import { SquareArrowRightEnter } from "lucide-react";
import { User } from "lucide-react";

/**
 * Profile on the customer navbar. It reads a minimal session model and can
 * later be connected to a real session API without changing Header.tsx.
 * IMPORTANT: browser-only demo sessions are not secure authentication.
 */
export default function UserNav() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sync = () => setSession(getDemoSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("nextpro-session-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("nextpro-session-change", sync);
    };
  }, [pathname]);

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

  if (session?.role === "admin") return null;
  if (session?.role !== "user") {
    if (pathname === "/login") return null;
    return (
      <Link className="btn btn-ghost btn-sm" href="/login">
        เข้าสู่ระบบ
      </Link>
    );
  }

  const username = session.username;
  const initial = username.trim().charAt(0).toUpperCase() || "U";

  const logout = () => {
    demoLogout();
    setSession(null);
    setOpen(false);
    router.replace("/");
    router.refresh();
  };

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
        <span className={s.avatar} aria-hidden="true">
          {initial}
        </span>
        <span className={s.identity}>
          <span className={s.name}>{username}</span>
          <span className={s.role}>สมาชิกทั่วไป</span>
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
            <span className={s.largeAvatar} aria-hidden="true">
              {initial}
            </span>
            <div className={s.menuIdentity}>
              <strong>{username}</strong>
              <span>สมาชิกทั่วไป</span>
            </div>
          </div>

          {/* หน้าแรก */}
          <div className={s.divider} />
          <Link href="/" className={s.menuItem} onClick={() => setOpen(false)}>
            <House size={18} />
            <span>หน้าแรก</span>
          </Link>

          {/* เลือกซื้อบัตร */}
          <Link
            href="/shop"
            className={s.menuItem}
            onClick={() => setOpen(false)}
          >
            <Store size={18} />
            <span>เลือกซื้อบัตร</span>
          </Link>

          {/* คำสั่งซื้อ */}
          <Link
            href="/my-orders"
            className={s.menuItem}
            onClick={() => setOpen(false)}
          >
            <ScrollText size={18} />
            <span>คำสั่งซื้อของฉัน</span>
          </Link>

          {/* โปรไฟล์ */}
          <Link
            href="/profile"
            className={s.menuItem}
            onClick={() => setOpen(false)}
          >
            <User size={18} />
            <span>ข้อมูลส่วนตัว</span>
          </Link>

          <div className={s.divider} />
          <button
            className={`${s.menuItem} ${s.logout}`}
            role="menuitem"
            type="button"
            onClick={logout}
          >
            <SquareArrowRightEnter size={18} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  );
}

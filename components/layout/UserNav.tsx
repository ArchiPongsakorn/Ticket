"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { demoLogout, getDemoSession, type DemoSession } from "@/lib/mock-auth";
import s from "./UserNav.module.css";

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
    return <Link className="btn btn-ghost btn-sm" href="/login">เข้าสู่ระบบ</Link>;
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
        <span className={s.avatar} aria-hidden="true">{initial}</span>
        <span className={s.identity}>
          <span className={s.name}>{username}</span>
          <span className={s.role}>สมาชิกทั่วไป</span>
        </span>
        <svg className={`${s.chevron} ${open ? s.rotated : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={s.menu} role="menu" aria-label="เมนูบัญชีผู้ใช้">
          <div className={s.menuAccount}>
            <span className={s.largeAvatar} aria-hidden="true">{initial}</span>
            <div className={s.menuIdentity}>
              <strong>{username}</strong>
              <span>สมาชิกทั่วไป</span>
            </div>
          </div>
          <div className={s.divider} />
          <Link className={s.menuItem} role="menuitem" href="/" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>
            หน้าแรก
          </Link>
          <Link className={s.menuItem} role="menuitem" href="/shop" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 8h16l-1 12H5L4 8ZM8 9V6a4 4 0 0 1 8 0v3"/></svg>
            เลือกซื้อบัตร
          </Link>
          <div className={s.divider} />
          <button className={`${s.menuItem} ${s.logout}`} role="menuitem" type="button" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg>
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}

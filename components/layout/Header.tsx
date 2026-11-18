"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cx } from "../../lib/cx";
import s from "./header.module.css";
import UserNav from "./UserNav";
import ShopLink from "@/components/auth/ShopLink";
import { AUTH_CHANGE_EVENT, getCurrentUser, logoutLocalUser, ROLE_LABELS, type AuthUser } from "@/lib/local-auth";

const LINKS = [
  { id: "home", href: "/", label: "หน้าแรก" },
  { id: "shop", href: "/shop", label: "เลือกซื้อบัตร" },
];

interface HeaderProps {
  current?: "home" | "shop";
  children?: import("react").ReactNode;
}

export default function Header({
  current,
  children,
}: HeaderProps) {
  // ตรวจสอบว่าอยู่หน้า URL ไหน
  const pathname = usePathname();
  const [signedInUser, setSignedInUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const sync = () => setSignedInUser(getCurrentUser());
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  // ตรวจสอบว่าเป็นหน้า Login หรือ Register หรือไม่
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  // หน้า Login/Register ให้แสดงเฉพาะหน้าแรก
  const visibleLinks = isAuthPage
    ? LINKS.filter((link) => link.id === "home")
    : LINKS;

  return (
    <header className={s.header}>
      <div className={cx("wrap", s.headerRow)}>

        {/* โลโก้เว็บไซต์ */}
        <Link className={s.logo} href="/">
          <span className={s.logoMark} aria-hidden="true">
            AAA
          </span>
          <span className={s.logoText}>Ticket</span>
        </Link>

        {/* เมนูหลัก */}
        <nav className={s.nav} aria-label="เมนูหลัก">
          {visibleLinks.map((l) => {
            const className = cx(
              s.navLink,
              current === l.id && s.isCurrent
            );

            if (l.id === "shop") {
              return (
                <ShopLink
                  key={l.id}
                  className={className}
                >
                  {l.label}
                </ShopLink>
              );
            }

            return (
              <Link
                key={l.id}
                href={l.href}
                className={className}
                aria-current={
                  current === l.id ? "page" : undefined
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* องค์ประกอบเดิม ซ่อนในหน้า Login */}
        {!isAuthPage && children}

        {/* โปรไฟล์ User ซ่อนในหน้า Login */}
        {!isAuthPage && <UserNav user={signedInUser ? { username: signedInUser.username, label: ROLE_LABELS[signedInUser.role] } : null} onLogout={logoutLocalUser} />}

      </div>
    </header>
  );
}

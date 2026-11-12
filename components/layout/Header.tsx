"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cx } from "../../lib/cx";
import s from "./header.module.css";
import UserNav from "./UserNav";
import ShopLink from "@/components/auth/ShopLink";

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
            A
          </span>
          <span className={s.logoText}>AAA</span>
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
        {!isAuthPage && <UserNav />}

      </div>
    </header>
  );
}

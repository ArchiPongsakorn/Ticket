"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import AdminMenu from "@/components/admin/admin-menu";
import AuditLogContent from "@/components/admin/audit-log-content";
import CheckSlipContent from "@/components/admin/check-slip-content";
import DashboardContent from "@/components/admin/dashboard-content";
import EventTokenManagementSystem from "./event-tokens/page";
import PricingContent from "@/components/admin/pricing-content";
import ReportContent from "@/components/admin/report-content";
import StoreManagementContent from "@/components/admin/store-management-content";
import UserManagementContent from "@/components/admin/user-management-content";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/admin/tailgrids/core/sidebar";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/admin/tailgrids/core/avatar";

import {
  getCurrentUser,
  logoutLocalUser,
  AUTH_CHANGE_EVENT,
} from "@/lib/local-auth";

type DashboardRole = "admin" | "staff" | "merchant";

export default function Home() {
  const router = useRouter();

  const [activePage, setActivePage] = useState("dashboard");
  const [role, setRole] = useState<DashboardRole | null>(null);
  const roleRef = useRef<DashboardRole | null>(null);

  // ตรวจสอบ Role
  useEffect(() => {
    const checkRole = () => {
      const user = getCurrentUser();

      if (
        user?.role === "admin" ||
        user?.role === "staff" ||
        user?.role === "merchant"
      ) {
        setRole(user.role);
        if (roleRef.current !== user.role) {
          roleRef.current = user.role;

        // 1-HOME
        // หน้าแรกของแต่ละ Role
          if (user.role === "staff") {
            setActivePage("Token");
          } else if (user.role === "merchant") {
            setActivePage("shop");
          } else {
            setActivePage("dashboard");
          }
        }
      } else {
        roleRef.current = null;
        setRole(null);
        router.replace(user ? "/" : "/login");
      }
    };

    checkRole();

    window.addEventListener(AUTH_CHANGE_EVENT, checkRole);
    window.addEventListener("storage", checkRole);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkRole);
      window.removeEventListener("storage", checkRole);
    };
  }, [router]);

  // ออกจากระบบ
  const handleLogout = () => {
    sessionStorage.removeItem("ticket:returnTo");
    logoutLocalUser();
    window.location.replace("/login");
  };
  //2  PAGE-TRUE
  // จำกัดหน้า Staff และ Merchant
  const currentPage =
    //staff true & false ///// true & true = Token
    role === "staff" && !["Token", "scan-qr", "scan-qr-shop"].includes(activePage)
      ? "Token"
      : role === "merchant" && !["shop", "scan-qr-shop"].includes(activePage)
        ? "shop"
        : activePage;

  const pageTitle =
    currentPage === "Token" || currentPage === "Admintoken" ? "เติม Token"
      : currentPage === "scan-qr" || currentPage === "qrevent" ? "สแกนบัตรเข้างาน"
        : currentPage === "shop" || currentPage === "Merchant" ? "ร้านค้า"
          : currentPage === "scan-qr-shop" || currentPage === "qrmerchant" ? "สแกน QR TOKEN ร้านค้า"
            : currentPage === "dashboard" ? "Dashboard"
              : currentPage;

  useEffect(() => {
    if (role === "staff" || role === "merchant") {
      document.title = `${pageTitle} | ${role === "staff" ? "Staff" : "Merchant"} UI`;
    }
  }, [pageTitle, role]);

  // เมนูสำหรับ Staff และ Merchant
  //3-ROLE-MENU
  const limitedMenus =
    role === "staff"
      ? //TURE
        [
          { id: "Token", label: "เติม Token" },
          { id: "scan-qr", label: "สแกน QR CODE เข้างาน" },
          { id: "scan-qr-shop", label: "สแกน QR ตัด Token" },
        ]
      : //FALSE
        [
          { id: "shop", label: "ร้านค้า" },
          { id: "scan-qr-shop", label: "สแกน QR ตัด Token" },
        ];

  // เลือกเนื้อหาที่จะแสดง
  let content = <DashboardContent onNavigate={setActivePage} />;

  if (currentPage === "check-slip") {
    content = <CheckSlipContent />;
  } else if (currentPage === "audit-log") {
    content = <AuditLogContent />;
  } else if (currentPage === "report") {
    content = <ReportContent />;
  } else if (["stores", "Shop"].includes(currentPage)) {
    content = <StoreManagementContent />;
  } else if (currentPage === "users") {
    content = <UserManagementContent />;
  } else if (["pricing", "PriceAdmin"].includes(currentPage)) {
    content = <PricingContent />;
  } else if (
    [
      "Token",
      "Admintoken",
      "scan-qr",
      "qrevent",
      "shop",
      "Merchant",
      "scan-qr-shop",
      "qrmerchant",
    ].includes(currentPage)
  ) {
    const section:
      | "topup"
      | "checkin"
      | "products"
      | "pos"
      | "store"
      | "shop-scan" =
      currentPage === "Token" || currentPage === "Admintoken"
        ? "topup"
        : currentPage === "scan-qr" || currentPage === "qrevent"
          ? "checkin"
          : currentPage === "shop" || currentPage === "Merchant"
            ? "store"
            : currentPage === "scan-qr-shop" || currentPage === "qrmerchant"
              ? "shop-scan"
              : "pos";

    content = <EventTokenManagementSystem section={section} />;
  }

  // ไม่แสดงเนื้อหาก่อนตรวจ Role
  if (!role) {
    return <div className="min-h-screen bg-[#0a1220]" />;
  }

  const roleName =
    role === "admin" ? "Admin" : role === "staff" ? "Staff" : "Merchant";

  const roleDescription =
    role === "admin" ? "ผู้ดูแลระบบ" : role === "staff" ? "เจ้าหน้าที่" : "ร้านค้า";

  return (
    <SidebarProvider
      className="bg-[#0a1220]"
      style={{ "--sidebar-width": "220px" } as CSSProperties}
    >
      <Sidebar className="border-r border-[#263c57] bg-[#0F2038] px-3.75 py-5.5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1.25">
          <div className="size-7.5 rounded-lg bg-[#49a5fb]" />
          <span className="text-[14px] font-semibold text-white">
            {roleName} UI
          </span>
        </div>

        {/* Sidebar Menu */}
        <SidebarContent className="mt-10 overflow-hidden px-0">
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {role === "admin" ? (
                <AdminMenu activePage={currentPage} onSelect={setActivePage} />
              ) : (
                <div className="flex flex-col gap-2">
                  {limitedMenus.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => setActivePage(menu.id)}
                      className={`w-full rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                        currentPage === menu.id
                          ? "border border-blue-500 bg-[#1e416a] text-white"
                          : "text-[#9bbfea] hover:bg-[#1e3654]"
                      }`}
                    >
                      {menu.label}
                    </button>
                  ))}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Profile */}
        <div className="mt-auto flex w-full items-center gap-3 px-1.25">
          <Avatar className="shrink-0" size="md">
            <AvatarFallback>{roleName.charAt(0)}</AvatarFallback>
            <AvatarBadge status="online" size="lg" ping />
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {roleName}
            </p>
            <p className="truncate text-xs text-[#8fa6c2]">{roleDescription}</p>
          </div>
        </div>
      </Sidebar>

      {/* Main Content */}
      <main className="min-h-full min-w-0 flex-1">{content}</main>

      {/* Logout มุมขวาล่าง */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          fixed bottom-6 right-6 z-50
          flex items-center gap-2
          rounded-xl border border-red-500/30
          bg-[#0F2038] px-4 py-3
          text-sm font-medium text-red-400 shadow-lg
          transition-colors
          hover:bg-red-500 hover:text-white
        "
      >
        <LogOut size={18} />
        ออกจากระบบ
      </button>
    </SidebarProvider>
  );
}

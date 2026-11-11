"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/mock-auth";
import DemoRoleBar from "@/components/DemoRoleBar";
import AdminMenu from "@/components/admin/admin-menu";
import AuditLogContent from "@/components/admin/audit-log-content";
import BlankPageContent from "@/components/admin/blank-page-content";
import CheckSlipContent from "@/components/admin/check-slip-content";
import DashboardContent from "@/components/admin/dashboard-content";
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


export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [canView, setCanView] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getDemoSession();
    if (session?.role === "admin") {
      setCanView(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  let content = <DashboardContent />;

  if (activePage === "check-slip") {
    content = <CheckSlipContent />;
  } else if (activePage === "audit-log") {
    content = <AuditLogContent />;
  } else if (activePage === "report") {
    content = <ReportContent />;
  } else if (activePage === "stores") {
    content = <StoreManagementContent />;
  } else if (activePage === "users") {
    content = <UserManagementContent />;
  } else if (["Token", "scan-qr", "pricing", "shop", "scan-qr-shop"].includes(activePage)) {
    content = <BlankPageContent />;
  }

  if (!canView) return <div role="status" style={{ padding: 32 }}>กำลังตรวจสอบสิทธิ์บัญชี Demo…</div>;

  return (
    <SidebarProvider
      className="bg-[#0a1220]"
      style={{ "--sidebar-width": "220px" } as CSSProperties}
    >
      <Sidebar className="border-r border-[#263c57] bg-[#0F2038] px-3.75 py-5.5">
        <div className="flex items-center gap-2.5 px-1.25">
          <div className="size-7.5 rounded-lg bg-[#49a5fb]" />
          <span className="text-[14px] font-semibold text-white">Admin UI</span>
        </div>

        
        <SidebarContent className="mt-10 overflow-hidden px-0 ">
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <AdminMenu activePage={activePage} onSelect={setActivePage} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* โปรไฟล์ */}
        <div className="mt-auto flex w-full items-center gap-3 px-1.25">
          <Avatar className="shrink-0" size="md">
            <AvatarFallback>A</AvatarFallback>
            <AvatarBadge status="online" size="lg" ping />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">Admin</p>
            <p className="truncate text-xs text-[#8fa6c2]">ผู้ดูแลระบบ</p>
          </div>
        </div>
      </Sidebar>

      
      <main className="min-h-full min-w-0 flex-1">
        {content}
      </main>
      <DemoRoleBar role="admin" />
    </SidebarProvider>
  );
}

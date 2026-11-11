"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/tailgrids/core/sidebar";

export const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "check-slip", label: "CheckSlip" },
  { id: "users", label: "จัดการ User" },
  { id: "Token", label: "เติม Token" },
  { id: "scan-qr", label: "สแกน QR CODE เข้างาน" },
  { id: "pricing", label: "ตั้งราคา" },
  { id: "stores", label: "จัดการร้านค้า" },
  { id: "report", label: "Report" },
  { id: "audit-log", label: "Audit Log" },
  { id: "shop", label: "ร้านค้า" },
  { id: "scan-qr-shop", label: "สแกน QR TOKEN ร้านค้า" },
];

type AdminMenuProps = {
  activePage: string;
  onSelect: (id: string) => void;
};

export default function AdminMenu({ activePage, onSelect }: AdminMenuProps) {
  
  return (
    <SidebarMenu className="gap-px">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton 
            isActive = {activePage === item.id}
            className="h-15 rounded-[7px] px-2.5 text-[15px] font-medium text-[#a6b8cc] hover:bg-[#19395e] hover:text-white data-[active=true]:bg-[#19395e] data-[active=true]:text-white"
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

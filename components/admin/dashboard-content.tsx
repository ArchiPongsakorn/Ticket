"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/admin/tailgrids/core/progress";
import SalesChart from "@/components/admin/sales-chart";
import { CUSTOMER_ORDERS_STORAGE_KEY, type CustomerOrder } from "@/lib/api";
import { readJSON } from "@/lib/storage";
import { AUDIT_LOG_EVENT, AUDIT_LOG_STORAGE_KEY, type AuditLogEntry } from "@/lib/audit-log";
import type { Attendee } from "@/components/admin/event-tokens/types";
import { ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES, removeMockStores, type ManagedStore } from "@/lib/admin-stores";
import type { ActivityLog } from "@/components/admin/event-tokens/types";

const STORE_BAR_COLORS = ["#2563eb", "#6d5dfc", "#10b981", "#eab308", "#f97316", "#ec4899"];
type StoreSalesRow = { id: string; name: string; Sale: number; progress: number; barColor: string };
const DASHBOARD_STATS = [
  { label: "บัตรที่อนุมัติแล้ว", detail: "จากบัตรทั้งหมด", valueClass: "text-[#4da6ff]" },
  { label: "รอตรวจสอบ", detail: "ต้องดำเนินการ", valueClass: "text-[#ffc857]" },
  { label: "เข้ามาในงานแล้ว", detail: "", valueClass: "text-[#63e6ae]" },
  { label: "Token ที่เติมแล้ว", detail: "", valueClass: "text-[#a887ff]" },
];

export default function DashboardContent({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [summary, setSummary] = useState({ approved: 0, review: 0, checkedIn: 0, toppedUp: 0 });
  const [pendingSlipOrders, setPendingSlipOrders] = useState<CustomerOrder[]>([]);
  const [storeSales, setStoreSales] = useState<StoreSalesRow[]>([]);
  useEffect(() => {
    // Remove the obsolete JSON-backed snapshot; orders and summaries live in their own real storage keys.
    window.localStorage.removeItem("admin-dashboard-data");
  }, []);
  useEffect(() => {
    const refreshSummary = () => {
      const customerOrders = readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []);
      const attendees = readJSON<Attendee[]>("admin-event-attendees", []);
      const auditLogs = readJSON<AuditLogEntry[]>(AUDIT_LOG_STORAGE_KEY, []);
      const paidOrderIds = new Set(customerOrders.filter((order) => order.status === "paid").map((order) => order.id));
      const approved = customerOrders.reduce(
        (total, order) => total + (order.status === "paid" ? (order.tickets?.length ?? 0) : 0),
        0,
      );
      const review = customerOrders.filter((order) => order.status === "review").length;
      const checkedIn = attendees.filter(
        (attendee) => attendee.checkedIn && attendee.orderId && paidOrderIds.has(attendee.orderId),
      ).length;
      const toppedUp = auditLogs.reduce((total, entry) => {
        if (entry.action !== "เติม Token") return total;
        const amount = entry.detail.match(/(\d+)\s*Token/i)?.[1];
        return total + Number(amount ?? 0);
      }, 0);
      setSummary({ approved, review, checkedIn, toppedUp });
      setPendingSlipOrders(customerOrders.filter((order) => order.status === "review"));
    };
    refreshSummary();
    window.addEventListener("storage", refreshSummary);
    window.addEventListener("ticket:orders-updated", refreshSummary);
    window.addEventListener(AUDIT_LOG_EVENT, refreshSummary);
    return () => {
      window.removeEventListener("storage", refreshSummary);
      window.removeEventListener("ticket:orders-updated", refreshSummary);
      window.removeEventListener(AUDIT_LOG_EVENT, refreshSummary);
    };
  }, []);
  useEffect(() => {
    const refreshStoreSales = () => {
      const stores = removeMockStores(readJSON<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES));
      const logs = readJSON<ActivityLog[]>("admin-event-activity-logs", []);
      const salesByStore = new Map<string, number>();
      for (const log of logs) {
        if (log.storeId && typeof log.tokenAmount === "number") {
          salesByStore.set(log.storeId, (salesByStore.get(log.storeId) ?? 0) + log.tokenAmount);
        }
      }
      const maxSales = Math.max(0, ...stores.map((store) => salesByStore.get(store.id) ?? 0));
      setStoreSales(stores.map((store, index) => {
        const sales = salesByStore.get(store.id) ?? 0;
        return {
          id: store.id,
          name: store.name,
          Sale: sales,
          progress: maxSales > 0 ? Math.round((sales / maxSales) * 100) : 0,
          barColor: STORE_BAR_COLORS[index % STORE_BAR_COLORS.length],
        };
      }));
    };
    refreshStoreSales();
    window.addEventListener("storage", refreshStoreSales);
    return () => window.removeEventListener("storage", refreshStoreSales);
  }, []);
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8 xl:h-svh xl:overflow-hidden ">
      
      {/*บน*/}
      <div className="w-full">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ">

          {DASHBOARD_STATS.map((stat, index) => {
            const values = [
              summary.approved.toLocaleString("th-TH"),
              summary.review.toLocaleString("th-TH"),
              `${summary.checkedIn.toLocaleString("th-TH")} คน`,
              summary.toppedUp.toLocaleString("th-TH"),
            ];
            return (
            <div key={stat.label} className="rounded-[15px] border border-[#244466] bg-[#10233d] px-4 py-4 sm:px-5">
              
              <p className=" text-[#8fa6c2]">
              {stat.label}
              </p>

              <p className={`mt-3 text-[30px] font-bold tracking-tight ${stat.valueClass}`}>
              {values[index] ?? "0"}
              </p>

              <p className="mt-2 text-[15px] text-[#7188a5]">
                {stat.detail}
                </p>

            </div>
          );})}

        </section>

        {/* ตาราง */}
        <section className="mt-6 grid items-stretch gap-x-8 gap-y-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
          
          <div className="rounded-[15px] border border-[#244466] bg-[#10233d] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">รอตรวจสลิป</h2>
            <button type="button" onClick={() => onNavigate("check-slip")} className="shrink-0 rounded-lg bg-[#49a5fb] px-4 py-2 text-xs font-semibold text-[#071426] transition hover:bg-[#368fdf] sm:text-sm">ไปหน้าตรวจสลิป</button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-130 border-collapse text-left text-">

                <thead>
                  <tr className="border-b border-[#244466] text-[#8fa6c2]">
                    <th className="px-2 pb-3 font-normal">คำสั่งซื้อ</th>
                    <th className="px-2 pb-3 font-normal">ผู้ซื้อ</th>
                    <th className="px-2 pb-3 font-normal">รายการ</th>
                    <th className="px-2 pb-3 text-right font-normal">ยอด</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingSlipOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#244466] last:border-b-0"
                    >
                      <td className="px-2 py-2 text-[#9db0c7]">{order.id}</td>
                      <td className="px-2 py-2 text-[#d6e0ed]">
                        {order.buyerName || order.tickets?.[0]?.name || order.ownerEmail || "ลูกค้า"}
                      </td>
                      <td className="px-2 py-2 text-[#8fa6c2]">{order.tier}</td>
                      <td className="px-2 py-2 text-right font-semibold text-white">{order.total.toLocaleString("th-TH")}</td>
                    </tr>
                  ))}
                  {pendingSlipOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-sm text-[#8fa6c2]">ยังไม่มีคำสั่งซื้อที่ส่งสลิปรอตรวจสอบ</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* ร้านค้า */}
          <div className="rounded-[15px] border border-[#244466] bg-[#10233d] p-4">
            <h2 className="text-base font-bold">ยอดขายแต่ละร้าน</h2>
            <div className="mt-5 space-y-4">

              {storeSales.map((store) => (
                <div key={store.name}>
                  <div className="mb-2 flex items-center justify-between text-base leading-6">
                    <span className="text-[#d6e0ed]">{store.name}</span>
                    <span className="tabular-nums text-[#8fa6c2]">
                      {store.Sale.toLocaleString("th-TH")}
                    </span>
                  </div>
                  
                  <Progress
                    progress={store.progress}
                    className="max-w-none"
                    trackColor="#1d3858"
                    barColor={store.barColor}
                  />
                
                </div>
              ))}
              {storeSales.length === 0 && <p className="text-sm text-[#8fa6c2]">ยังไม่มีร้านค้าที่บันทึกไว้</p>}
            </div>
          </div>
          
          <div className="rounded-xl border border-[#244466] bg-[#10233d] p-5">
            <SalesChart />
          </div>
        
        </section>
      </div>
    </main>
  );
}

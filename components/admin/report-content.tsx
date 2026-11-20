"use client";

import { useEffect } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES, removeMockStores, type ManagedStore } from "@/lib/admin-stores";
import type { ActivityLog } from "@/components/admin/event-tokens/types";
import { readJSON } from "@/lib/storage";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/admin/tailgrids/core/table";

export default function ReportContent() {
  const [stores, setStores, storesReady] = usePersistentState<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES);
  const [logs, setLogs] = usePersistentState<ActivityLog[]>("admin-event-activity-logs", []);
  const visibleStores = removeMockStores(stores);
  useEffect(() => {
    if (storesReady && visibleStores.length !== stores.length) setStores(visibleStores);
    const refresh = (event: StorageEvent) => {
      if (event.key === ADMIN_STORES_STORAGE_KEY) {
        setStores(removeMockStores(readJSON<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES)));
      }
      if (event.key === "admin-event-activity-logs") {
        setLogs(readJSON<ActivityLog[]>("admin-event-activity-logs", []));
      }
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [setLogs, setStores, stores, storesReady]);

  const storeReports = visibleStores.map((store) => {
    const sales = logs.filter((log) => log.storeId === store.id && typeof log.tokenAmount === "number");
    const tokens = sales.reduce((sum, sale) => sum + Number(sale.tokenAmount ?? 0), 0);
    return { ...store, salesCount: sales.length, tokens };
  });
  const totalStoreSales = storeReports.reduce((sum, store) => sum + store.tokens, 0);
  const totalTransactions = storeReports.reduce((sum, store) => sum + store.salesCount, 0);
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="w-full max-w-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Report</h1>
            <p className="mt-2 text-sm text-[#8fa6c2]">
              ยอดขายและค่าใช้จ่ายของแต่ละร้านจากข้อมูลปัจจุบัน
            </p>
          </div>


        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">ยอดขายรวม (Token)</p>
            <p className="mt-3 text-2xl font-bold text-[#a887ff]">
              {totalStoreSales}
            </p>
          </div>
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">จำนวนรายการขาย</p>
            <p className="mt-3 text-2xl font-bold text-[#4da6ff]">
              {totalTransactions}
            </p>
          </div>
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">ร้านค้าที่จัดการ</p>
            <p className="mt-3 text-2xl font-bold text-[#35d6c0]">
              {storeReports.length}
            </p>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
          <div className="overflow-x-auto">
            <TableRoot className="w-full min-w-155 border-[#244466] text-left text-sm">
              <TableHeader>
                <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                  <TableHead className="px-2 pb-3 font-normal">ร้านค้า</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">ยอดขาย (Token)</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">สัดส่วน</TableHead>
                  <TableHead className="w-[38%] px-2 pb-3 font-normal"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeReports.map((store) => {
                  const progress = totalStoreSales > 0 ? Math.round((store.tokens / totalStoreSales) * 100) : 0;
                  return (
                  <TableRow
                    key={store.id}
                    className="border-b border-[#244466] last:border-b-0"
                  >
                    <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">
                      {store.name}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">
                      {store.tokens.toLocaleString("th-TH")}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[#8fa6c2]">
                      {progress}%
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-[#1d3858]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: "#49a5fb",
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {storeReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-2 py-8 text-center text-[#8fa6c2]">ยังไม่มีร้านค้าในระบบ</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableRoot>
          </div>
        </section>
      </div>
    </main>
  );
}



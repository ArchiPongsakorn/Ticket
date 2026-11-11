"use client";

import dashboardData from "@/data/admin/dashboard.json";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/admin/tailgrids/core/table";

const totalStoreSales = dashboardData.storeSales.reduce(
  (total, store) => total + Number(store.Sale),
  0,
);

const totalProductSales = dashboardData.orders.reduce(
  (total, order) =>
    total + Number(order["price-ticket"]) + Number(order["price-shirt"]),
  0,
);

export default function ReportContent() {
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

          <button
            type="button"
            className="rounded-xl border border-[#49a5fb] px-4 py-2.5 text-sm font-semibold text-[#49a5fb] transition-colors hover:bg-[#19395e]"
          >
            Export CSV
          </button>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">ยอดขายรวม (Token)</p>
            <p className="mt-3 text-2xl font-bold text-[#a887ff]">
              [{totalStoreSales}]
            </p>
          </div>
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">ยอดขายบัตรและเสื้อ (บาท)</p>
            <p className="mt-3 text-2xl font-bold text-[#4da6ff]">
              [{totalProductSales}]
            </p>
          </div>
          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm text-[#8fa6c2]">ค่าใช้จ่ายผู้เข้าร่วม (Token)</p>
            <p className="mt-3 text-2xl font-bold text-[#35d6c0]">
              [{totalStoreSales}]
            </p>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
          <div className="overflow-x-auto">
            <TableRoot className="w-full min-w-[620px] border-[#244466] text-left text-sm">
              <TableHeader>
                <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                  <TableHead className="px-2 pb-3 font-normal">ร้านค้า</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">ยอดขาย (Token)</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">สัดส่วน</TableHead>
                  <TableHead className="w-[38%] px-2 pb-3 font-normal"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.storeSales.map((store) => (
                  <TableRow
                    key={store.name}
                    className="border-b border-[#244466] last:border-b-0"
                  >
                    <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">
                      {store.name}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">
                      {(Number(store.Sale))}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-[#8fa6c2]">
                      {store.progress}%
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-[#1d3858]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${store.progress}%`,
                            backgroundColor: store.barColor,
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </section>
      </div>
    </main>
  );
}



"use client";

import dashboardData from "@/data/admin/dashboard.json";
import { Badge } from "@/components/admin/tailgrids/core/badge";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/admin/tailgrids/core/table";

export default function StoreManagementContent() {
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight">จัดการร้านค้า</h1>
        <p className="mt-2 text-sm text-[#8fa6c2]">
          สร้าง ลบ หรือจัดการร้านค้า และกำหนด Admin ประจำร้าน
        </p>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
            <div className="overflow-x-auto">
              <TableRoot className="w-full min-w-130 border-[#244466] text-left text-sm">
                <TableHeader>
                  <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                    <TableHead className="px-2 pb-3 font-normal">ร้านค้า</TableHead>
                    <TableHead className="px-2 pb-3 font-normal">สถานะ</TableHead>
                    <TableHead className="px-2 pb-3 font-normal">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.storeSales.map((store) => {
                    return (
                      <TableRow key={store.name} className="border-b border-[#244466] last:border-b-0">
                        <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">
                      [{store.name}]
                        </TableCell>

                        <TableCell className="px-2 py-3">
                          <Badge
                            size="sm"
                            color="success"
                            className="bg-[#064e3b] text-[#63e6ae]"
                          >
                            เปิดขาย
                          </Badge>
                        </TableCell>

                        <TableCell className="px-2 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-[#244466] px-3 py-2 text-xs text-[#d6e0ed] hover:bg-[#19395e]"
                            >
                              เปลี่ยน Admin
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-[#244466] px-3 py-2 text-xs text-[#fca5a5] hover:bg-[#4c1d1d]"
                            >
                              ลบ
                            </button>
                          </div>
                        </TableCell>
                        
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableRoot>
            </div>
          </div>

          <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="text-base font-bold">เพิ่มร้านค้าใหม่</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-[#d6e0ed]">
                ชื่อร้านค้า
                <input
                  type="text"
                  placeholder="ชื่อร้าน"
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                />
              </label>
              <label className="block text-sm text-[#d6e0ed]">
                Admin ประจำร้าน (อีเมล)
                <input
                  type="email"
                  placeholder="admin@email.com"
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                />
              </label>
              <button
                type="button"
                className="w-full rounded-xl bg-[#49a5fb] px-4 py-3 text-sm font-bold text-[#0a1628] hover:bg-[#6bb7ff]"
              >
                สร้างร้านค้า
              </button>
              <p className="text-xs leading-5 text-[#7188a5]">
                ร้านค้าไม่สามารถเพิ่มเองได้ การสร้าง ลบ
                และเปลี่ยนร้านค้าจะถูกบันทึกใน Audit Log
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

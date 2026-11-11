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

export default function AuditLogContent() {
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="mt-2 text-sm text-[#8fa6c2]">
          บันทึกทุกการกระทำของ Admin, Staff และร้านค้า เพื่อตรวจสอบย้อนหลัง
        </p>

        <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
          <label className="text-sm text-[#d6e0ed]">
            ค้นหา
            <input
              type="text"
              placeholder="ผู้ทำรายการ หรือรายละเอียด"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-[#d6e0ed] outline-none placeholder:text-[#7188a5]"
            />
          </label>

          <label className="text-sm text-[#d6e0ed]">
            ประเภทการกระทำ
            <select
              defaultValue="all"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-[#d6e0ed] outline-none"
            >
              <option value="all">ทั้งหมด</option>
              <option value="slip">ตรวจสลิป</option>
              <option value="token">เติม Token</option>
              <option value="store">จัดการร้านค้า</option>
            </select>
          </label>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
          <div className="overflow-x-auto">
            <TableRoot className="w-full min-w-175 border-[#244466] text-left text-sm">
              <TableHeader>
                <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                  <TableHead className="px-2 pb-3 font-normal">เวลา</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">ผู้ทำรายการ</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">การกระทำ</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dashboardData.auditLogs.map((log) => (
                  <TableRow key={`${log.actor}-${log.action}-${log.detail}`} className="border-b border-[#244466] last:border-b-0">
                    <TableCell className="px-2 py-3 text-[#9db0c7]">{log.time}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{log.actor}</TableCell>
                    <TableCell className="px-2 py-3"><span className="inline-flex rounded-full bg-[#19395e] px-2.5 py-1 text-xs font-medium text-[#9dc9f5]">{log.action}</span></TableCell>
                    <TableCell className="px-2 py-3 text-[#9db0c7]">{log.detail}</TableCell>
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

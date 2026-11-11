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

const statusStyles = {
  "อนุมัติแล้ว": "bg-[#064e3b] text-[#63e6ae]",
  "รอตรวจสอบ": "bg-[#5b4300] text-[#ffd166]",
  "ไม่อนุมัติ": "bg-[#4c1d1d] text-[#fca5a5]",
};

export default function UserManagementContent() {
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการ User</h1>
            <p className="mt-2 text-sm text-[#8fa6c2]">รายชื่อผู้ลงทะเบียนทั้งหมด</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[#49a5fb] px-4 py-2.5 text-sm font-semibold text-[#49a5fb] hover:bg-[#19395e]"
          >
            ↓ &nbsp;Export CSV
          </button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,4fr)_minmax(180px,1fr)]">
          <label className="text-sm text-[#d6e0ed]">
            ค้นหา
            <input
              type="text"
              placeholder="ชื่อ นามสกุล หรืออีเมล"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
            />
          </label>
          <label className="text-sm text-[#d6e0ed]">
            สถานะ
            <select
              defaultValue="all"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-white outline-none"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ไม่อนุมัติ</option>
            </select>
          </label>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
          <div className="overflow-x-auto">
            <TableRoot className="w-full min-w-190 border-[#244466] text-left text-sm">
              <TableHeader>
                <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                  <TableHead className="px-2 pb-3 font-normal">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">อีเมล</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">บัตร</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">เสื้อ</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">Token</TableHead>
                  <TableHead className="px-2 pb-3 font-normal">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.users.map((user) => (
                  <TableRow
                    key={user.email}
                    className="border-b border-[#244466] last:border-b-0"
                  >
                    <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">{user.name}</TableCell>
                    <TableCell className="px-2 py-3 text-[#9db0c7]">{user.email}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.ticket}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.shirt}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.token}</TableCell>
                    <TableCell className="px-2 py-3">
                      <Badge
                        size="sm"
                        color={user.status === "อนุมัติแล้ว" ? "success" : user.status === "ไม่อนุมัติ" ? "error" : "warning"}
                        className={statusStyles[user.status as keyof typeof statusStyles]}
                      >
                        {user.status}
                      </Badge>
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

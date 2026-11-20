"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { AUDIT_LOG_EVENT, readAuditLogs, type AuditLogEntry } from "@/lib/audit-log";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/admin/tailgrids/core/table";

export default function AuditLogContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const refresh = () => setLogs(readAuditLogs());
    refresh();
    window.addEventListener(AUDIT_LOG_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUDIT_LOG_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const actionOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action))),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        [log.time, log.actor, log.action, log.detail].some((value) =>
          value.toLocaleLowerCase().includes(query),
        );
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [actionFilter, logs, search]);

  const hasFilters = search.trim() !== "" || actionFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
  };

  return (
    <main className="h-svh min-h-0 min-w-0 flex-1 overflow-hidden bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="flex h-full min-h-0 w-full flex-col">
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="mt-2 text-sm text-[#8fa6c2]">
          บันทึกทุกการกระทำของ Admin, Staff และร้านค้า เพื่อตรวจสอบย้อนหลัง
        </p>

        <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
          <label className="text-sm text-[#d6e0ed]">
            ค้นหา
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ผู้ทำรายการ หรือรายละเอียด"
              aria-label="ค้นหาบันทึกการกระทำ"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-[#d6e0ed] outline-none transition-colors placeholder:text-[#7188a5] focus:border-[#49a5fb] focus:ring-1 focus:ring-[#49a5fb]"
            />
          </label>

          <label className="text-sm text-[#d6e0ed]">
            ประเภทการกระทำ
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              aria-label="กรองตามประเภทการกระทำ"
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-[#d6e0ed] outline-none transition-colors focus:border-[#49a5fb] focus:ring-1 focus:ring-[#49a5fb]"
            >
              <option value="all">ทั้งหมด</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="mt-4 flex min-h-8 items-center justify-between gap-3 text-sm text-[#8fa6c2]">
          <span>
            แสดง {filteredLogs.length} จาก {logs.length} รายการ
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[#9dc9f5] transition-colors hover:bg-[#19395e] hover:text-white"
            >
              <X size={15} aria-hidden="true" />
              ล้างตัวกรอง
            </button>
          )}
        </div>

        <section className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
          <div className="min-h-0 flex-1 overflow-auto">
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
              {filteredLogs.map((log, index) => (
                <TableRow
                  key={`${log.actor}-${log.action}-${log.detail}-${index}`}
                  className="border-b border-[#244466] last:border-b-0"
                >
                  <TableCell className="px-2 py-3 text-[#9db0c7]">{log.time}</TableCell>
                  <TableCell className="px-2 py-3 text-[#d6e0ed]">{log.actor}</TableCell>
                  <TableCell className="px-2 py-3">
                    <span className="inline-flex rounded-full bg-[#19395e] px-2.5 py-1 text-xs font-medium text-[#9dc9f5]">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-[#9db0c7]">{log.detail}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="px-2 py-10 text-center text-[#8fa6c2]">
                    {logs.length === 0 ? "ยังไม่มีประวัติการทำงาน" : "ไม่พบรายการที่ตรงกับตัวกรอง"}
                  </TableCell>
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


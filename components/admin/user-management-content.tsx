"use client";

import { useEffect, useState } from "react";
import { CATALOG } from "@/data/catalog";
import { CUSTOMER_ORDERS_STORAGE_KEY, type CustomerOrder } from "@/lib/api";
import { ACCOUNT_STORAGE_KEY, deleteRegisteredUser } from "@/lib/local-auth";
import { readJSON, writeJSON } from "@/lib/storage";
import { recordAudit } from "@/lib/audit-log";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/admin/tailgrids/core/table";

type ManagedUser = {
  name: string;
  email: string;
  ticket: number;
  shirt: number;
  token: number;
};

type StoredAccount = { username: string; email: string; role: string };
const DELETED_USERS_KEY = "admin-users-deleted-emails";

function orderItemCounts(order: CustomerOrder) {
  if (order.items) {
    return order.items.reduce((counts, item) => {
      counts[item.type] += item.qty;
      return counts;
    }, { ticket: 0, merch: 0 });
  }

  return order.tier.split(" · ").reduce((counts, part) => {
    const product = CATALOG.find((candidate) => part.includes(candidate.name));
    const qty = Number(part.match(/×\\s*(\\d+)/)?.[1] ?? 0);
    if (product?.type === "ticket") counts.ticket += qty;
    if (product?.type === "merch") counts.merch += qty;
    return counts;
  }, { ticket: order.tickets?.length ?? 0, merch: 0 });
}

export default function UserManagementContent() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refreshUsers = () => {
      const accounts = readJSON<StoredAccount[]>(ACCOUNT_STORAGE_KEY, []).filter((account) => account.role === "user");
      const customerOrders = readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []);
      const attendees = readJSON<Array<{ name: string; email?: string; ownerEmail?: string; tokens?: number }>>("admin-event-attendees", []);
      const deletedEmails = new Set(readJSON<string[]>(DELETED_USERS_KEY, []).map((email) => email.toLowerCase()));
      const usersByEmail = new Map<string, ManagedUser>();

      accounts.forEach((account) => {
        const email = account.email.toLowerCase();
        usersByEmail.set(email, { name: account.username, email: account.email, ticket: 0, shirt: 0, token: 0 });
      });

      const latestOrderApplied = new Set<string>();
      customerOrders.forEach((order) => {
        const email = (order.ownerEmail || order.tickets?.find((ticket) => ticket.email)?.email || "").toLowerCase();
        if (!email) return;
        const user = usersByEmail.get(email) ?? {
          name: order.buyerName || order.tickets?.[0]?.name || email,
          email,
          ticket: 0,
          shirt: 0,
          token: 0,
        };
        const counts = orderItemCounts(order);
        user.ticket += counts.ticket;
        user.shirt += counts.merch;
        if (!latestOrderApplied.has(email)) {
          user.name = order.tickets?.find((ticket) => ticket.name)?.name || order.buyerName || user.name;
          latestOrderApplied.add(email);
        }
        usersByEmail.set(email, user);
      });

      attendees.forEach((attendee) => {
        const email = (attendee.ownerEmail || attendee.email || "").toLowerCase();
        const user = usersByEmail.get(email);
        if (user) user.token += Number(attendee.tokens ?? 0);
      });

      setUsers([...usersByEmail.values()].filter((user) => !deletedEmails.has(user.email.toLowerCase())));
    };
    refreshUsers();
    window.addEventListener("storage", refreshUsers);
    window.addEventListener("ticket:orders-updated", refreshUsers);
    window.addEventListener("ticket:auth-changed", refreshUsers);
    return () => {
      window.removeEventListener("storage", refreshUsers);
      window.removeEventListener("ticket:orders-updated", refreshUsers);
      window.removeEventListener("ticket:auth-changed", refreshUsers);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText);

    return matchesSearch;
  });

  const exportCsv = () => {
    const rows = [
      ["ชื่อ-นามสกุล", "อีเมล", "บัตร", "เสื้อ", "Token"],
      ...filteredUsers.map((user) => [user.name, user.email, user.ticket, user.shirt, user.token]),
    ];
    const csv = "\uFEFF" + rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteUser = (email: string, name: string) => {
    if (!window.confirm(`ต้องการลบผู้ใช้ ${name} ใช่หรือไม่?`)) return;

    deleteRegisteredUser(email);
    const deletedEmails = readJSON<string[]>(DELETED_USERS_KEY, []);
    writeJSON(DELETED_USERS_KEY, [...new Set([...deletedEmails, email.toLowerCase()])]);
    setUsers((previous) => previous.filter((user) => user.email !== email));
    recordAudit("ลบผู้ใช้", `${name} (${email})`);
  };

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
            onClick={exportCsv}
            className="rounded-xl bg-[#49a5fb] px-4 py-2.5 text-sm font-semibold text-[#071426] transition hover:bg-[#368fdf]"
          >
            Export CSV ({filteredUsers.length})
          </button>
        </div>

        <section className="mt-6 grid gap-4">
          <label className="text-sm text-[#d6e0ed]">
            ค้นหา
            <input
              type="text"
              placeholder="ชื่อ นามสกุล หรืออีเมล"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#244466] bg-[#10233d] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
            />
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
                  <TableHead className="px-2 pb-3 text-right font-normal"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.email}
                    className="border-b border-[#244466] last:border-b-0"
                  >
                    <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">{user.name}</TableCell>
                    <TableCell className="px-2 py-3 text-[#9db0c7]">{user.email}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.ticket}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.shirt}</TableCell>
                    <TableCell className="px-2 py-3 text-[#d6e0ed]">{user.token}</TableCell>
                    <TableCell className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.email, user.name)}
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500 hover:text-white"
                      >
                        ลบ
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-2 py-8 text-center text-[#8fa6c2]"
                    >
                      ไม่พบข้อมูลผู้ใช้งาน
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

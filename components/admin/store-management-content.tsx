"use client";

import { useEffect, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { recordAudit } from "@/lib/audit-log";
import { ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES, removeMockStores, type ManagedStore } from "@/lib/admin-stores";
import { AUTH_CHANGE_EVENT, getRegisteredUsers, syncMerchantRoles, type AuthUser } from "@/lib/local-auth";
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
  const [stores, setStores, storesReady] = usePersistentState<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES);
  const visibleStores = removeMockStores(stores);
  const [storeName, setStoreName] = usePersistentState("admin-store-draft-name", "");
  const [product, setProduct] = usePersistentState("admin-store-draft-product", "");
  const [adminEmail, setAdminEmail] = usePersistentState("admin-store-draft-email", "");
  const [message, setMessage] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>([]);

  useEffect(() => {
    if (!storesReady) return;
    if (visibleStores.length !== stores.length) setStores(visibleStores);
    syncMerchantRoles(visibleStores);
  }, [setStores, stores, storesReady]);

  useEffect(() => {
    const refreshUsers = () => setRegisteredUsers(getRegisteredUsers());
    refreshUsers();
    window.addEventListener("storage", refreshUsers);
    window.addEventListener(AUTH_CHANGE_EVENT, refreshUsers);
    return () => {
      window.removeEventListener("storage", refreshUsers);
      window.removeEventListener(AUTH_CHANGE_EVENT, refreshUsers);
    };
  }, []);

  const handleCreateStore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = storeName.trim();
    const productName = product.trim();
    const emailInput = adminEmail.trim();
    const registeredMerchant = registeredUsers.find((user) => user.email.toLowerCase() === emailInput.toLowerCase());

    if (!name || !productName || !emailInput) {
      setMessage("กรอกชื่อร้านค้า สินค้า และอีเมล Admin ให้ครบก่อน");
      return;
    }

    if (!registeredMerchant) {
      setMessage("อีเมลนี้ยังไม่ได้สมัครสมาชิก กรุณาให้ Merchant สมัครก่อน");
      return;
    }
    const email = registeredMerchant.email;

    if (visibleStores.some((store) => store.name.toLowerCase() === name.toLowerCase())) {
      setMessage("มีชื่อร้านค้านี้อยู่แล้ว");
      return;
    }

    const nextStores = [
      ...visibleStores,
      { id: `store-${Date.now()}`, name, product: productName, adminEmail: email, status: "เปิดขาย" },
    ];
    setStores(nextStores);
    syncMerchantRoles(nextStores);
    recordAudit("สร้างร้านค้า", `${name} · ${productName} · ${email}`);
    setStoreName("");
    setProduct("");
    setAdminEmail("");
    setMessage(`สร้างร้านค้า ${name} เรียบร้อยแล้ว`);
  };

  const handleDeleteStore = (store: ManagedStore) => {
    if (!window.confirm(`ต้องการลบร้านค้า ${store.name} ใช่หรือไม่?`)) return;

    const nextStores = visibleStores.filter((currentStore) => currentStore.id !== store.id);
    setStores(nextStores);
    syncMerchantRoles(nextStores);
    recordAudit("ลบร้านค้า", store.name);
    setMessage(`ลบร้านค้า ${store.name} แล้ว`);
  };

  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-4 text-white sm:p-6 lg:p-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight">จัดการร้านค้า</h1>
        <p className="mt-2 text-sm text-[#8fa6c2]">
          สร้าง ลบ หรือจัดการร้านค้า และกำหนด Admin ประจำร้าน
        </p>

        <section className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#244466] bg-[#10233d] p-3 sm:p-4">
            <div className="overflow-x-auto">
              <TableRoot className="w-full min-w-190 border-[#244466] text-left text-sm">
                <TableHeader>
                  <TableRow className="border-b border-[#244466] text-[#8fa6c2]">
                    <TableHead className="px-2 pb-3 font-normal">ร้านค้า</TableHead>
                    <TableHead className="px-2 pb-3 font-normal">สินค้า</TableHead>
                    <TableHead className="px-2 pb-3 font-normal">อีเมล</TableHead>
                    <TableHead className="px-2 pb-3 font-normal">สถานะ</TableHead>
                    <TableHead className="px-2 pb-3 text-right font-normal">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStores.map((store) => (
                    <TableRow
                      key={store.id}
                      className="border-b border-[#244466] last:border-b-0"
                    >
                      <TableCell className="px-2 py-3 font-medium text-[#d6e0ed]">
                        {store.name}
                      </TableCell>
                      <TableCell className="px-2 py-3 text-[#d6e0ed]">
                        {store.product}
                      </TableCell>
                      <TableCell className="px-2 py-3 text-[#9db0c7]">
                        {store.adminEmail}
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Badge
                          size="sm"
                          color="success"
                          className="bg-[#064e3b] text-[#63e6ae]"
                        >
                          {store.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteStore(store)}
                            className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-[#fca5a5] hover:bg-[#4c1d1d]"
                          >
                            ลบ
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </div>
          </div>

          <form
            onSubmit={handleCreateStore}
            className="rounded-2xl border border-[#244466] bg-[#10233d] p-4"
          >
            <h2 className="text-base font-bold">เพิ่มร้านค้าใหม่</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-[#d6e0ed]">
                ชื่อร้านค้า
                <input
                  type="text"
                  placeholder="ชื่อร้าน"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                  required
                />
              </label>
              <label className="block text-sm text-[#d6e0ed]">
                สินค้า
                <input
                  type="text"
                  placeholder="เช่น เครื่องดื่ม หรือ อาหาร"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                  required
                />
              </label>
              <label className="block text-sm text-[#d6e0ed]">
                Merchant ประจำร้าน (อีเมลที่สมัครแล้ว)
                <input
                  type="email"
                  list="registered-merchant-emails"
                  placeholder="เลือกอีเมลสมาชิกที่สมัครแล้ว"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                  required
                />
                <datalist id="registered-merchant-emails">
                  {registeredUsers.map((user) => (
                    <option key={user.id} value={user.email}>{user.username}</option>
                  ))}
                </datalist>
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#49a5fb] px-4 py-3 text-sm font-bold text-[#0a1628] hover:bg-[#6bb7ff]"
              >
                สร้างร้านค้า
              </button>
              {message && <p className="text-sm text-[#8fa6c2]">{message}</p>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

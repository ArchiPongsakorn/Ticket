"use client";

import { useState } from "react";
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

type ManagedStore = {
  id: string;
  name: string;
  product: string;
  adminEmail: string;
  status: string;
};

const INITIAL_STORES: ManagedStore[] = dashboardData.storeSales.map(
  (store) => ({
    id: store.id,
    name: store.name,
    product: store.product.name,
    adminEmail: store.adminEmail,
    status: store.status,
  }),
);

export default function StoreManagementContent() {
  const [stores, setStores] = useState<ManagedStore[]>(INITIAL_STORES);
  const [storeName, setStoreName] = useState("");
  const [product, setProduct] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateStore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = storeName.trim();
    const productName = product.trim();
    const email = adminEmail.trim();

    if (!name || !productName || !email) {
      setMessage("กรอกชื่อร้านค้า สินค้า และอีเมล Admin ให้ครบก่อน");
      return;
    }

    if (stores.some((store) => store.name.toLowerCase() === name.toLowerCase())) {
      setMessage("มีชื่อร้านค้านี้อยู่แล้ว");
      return;
    }

    setStores((currentStores) => [
      ...currentStores,
      {
        id: `store-${Date.now()}`,
        name,
        product: productName,
        adminEmail: email,
        status: "เปิดขาย",
      },
    ]);
    setStoreName("");
    setProduct("");
    setAdminEmail("");
    setMessage(`สร้างร้านค้า ${name} เรียบร้อยแล้ว`);
  };

  const handleDeleteStore = (store: ManagedStore) => {
    if (!window.confirm(`ต้องการลบร้านค้า ${store.name} ใช่หรือไม่?`)) return;

    setStores((currentStores) =>
      currentStores.filter((currentStore) => currentStore.id !== store.id),
    );
    setMessage(`ลบร้านค้า ${store.name} แล้ว`);
  };

  const handleChangeAdmin = (store: ManagedStore) => {
    const nextEmail = window.prompt(
      `อีเมล Admin ใหม่สำหรับ ${store.name}`,
      store.adminEmail,
    );
    if (!nextEmail?.trim()) return;

    setStores((currentStores) =>
      currentStores.map((currentStore) =>
        currentStore.id === store.id
          ? { ...currentStore, adminEmail: nextEmail.trim() }
          : currentStore,
      ),
    );
    setMessage(`เปลี่ยน Admin ของ ${store.name} แล้ว`);
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
                  {stores.map((store) => (
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
                            onClick={() => handleChangeAdmin(store)}
                            className="rounded-lg border border-[#244466] px-3 py-2 text-xs text-[#d6e0ed] hover:bg-[#19395e]"
                          >
                            เปลี่ยน Admin
                          </button>
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
                Admin ประจำร้าน (อีเมล)
                <input
                  type="email"
                  placeholder="admin@email.com"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7188a5]"
                  required
                />
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

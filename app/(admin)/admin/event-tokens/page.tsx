"use client";

import React, { useState } from "react";
import dashboardData from "@/data/admin/dashboard.json";
import CheckInScanSection from "@/components/admin/event-tokens/check-in-scan-section";
import MockQrCode from "@/components/admin/event-tokens/mock-qr-code";
import TopUpTokenSection from "@/components/admin/event-tokens/top-up-token-section";
import PricingContent from "@/components/admin/pricing-content";
import type {
  ActivityLog,
  Attendee,
} from "@/components/admin/event-tokens/types";
import { getCurrentUser } from "@/lib/local-auth";

// ==========================================
// ข้อมูลจำลอง (Mock Data) สำหรับทดสอบระบบ
// ==========================================
const INITIAL_ATTENDEES = [
  {
    id: "TKT-001",
    name: "สมชาย ใจดี",
    type: "VIP",
    tokens: 500,
    checkedIn: false,
  },
  {
    id: "TKT-002",
    name: "สมหญิง รักเรียน",
    type: "General",
    tokens: 120,
    checkedIn: true,
  },
  {
    id: "TKT-003",
    name: "อนันต์ มั่นคง",
    type: "General",
    tokens: 0,
    checkedIn: false,
  },
];

const INITIAL_PRODUCTS = [
  { id: "PRD-01", name: "น้ำดื่มเย็น", price: 20, stock: 100 },
  { id: "PRD-02", name: "ข้าวกล่องกะเพราไก่", price: 60, stock: 50 },
  { id: "PRD-03", name: "เสื้อยืดที่ระลึกงาน", price: 350, stock: 30 },
];

// Type กลางที่ใช้ร่วมกันทุกหน้าของระบบสินค้าและ Token
// อิงโครงสร้างสินค้าจากข้อมูลตั้งต้น เพื่อให้เพิ่ม/แก้ไขสินค้าได้อย่างปลอดภัย
type Product = (typeof INITIAL_PRODUCTS)[number];
type AddLog = (message: string, type?: string) => void;

type StoreDashboardProps = {
  addLog: AddLog;
  logs: ActivityLog[];
};

type AttendeeSectionProps = {
  attendees: Attendee[];
  setAttendees: React.Dispatch<React.SetStateAction<Attendee[]>>;
  addLog: AddLog;
};

type MerchantPosProps = AttendeeSectionProps & {
  products: Product[];
};

type ScanResult = {
  status: "success" | "error";
  message: string;
};

type EventTokenSection =
  | "topup"
  | "checkin"
  | "products"
  | "pos"
  | "store"
  | "shop-scan";

export default function EventTokenManagementSystem({
  section,
}: {
  section?: EventTokenSection;
}) {
  const [activeTab, setActiveTab] = useState("topup"); // 'topup' | 'checkin' | 'products' | 'pos'
  const visibleTab = section ?? activeTab;

  // State หลักของระบบ
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Helper บันทึกประวัติการทำรายการ
  const addLog = (message: string, type = "info") => {
    const time = new Date().toLocaleTimeString("th-TH");
    setLogs((prev) => [{ id: Date.now(), time, message, type }, ...prev]);
  };

  return (
    <div
      className={`${section === "checkin" ? "h-svh overflow-hidden p-3" : "min-h-screen p-4 md:p-8"} bg-[#0a1628] font-sans text-[#d6e0ed]`}
    >
      <div className={section === "checkin" ? "h-full w-full" : "w-full"}>
        {/* Header & Navigation */}
        {!section && (
          <header className="mb-6 bg-[#10233d] p-6 rounded-2xl shadow-sm border border-[#244466]">
            <h1 className="text-2xl font-bold text-white mb-4">
              ระบบจัดการงานอีเวนต์ & ร้านค้า Token
            </h1>
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === "topup"}
                onClick={() => setActiveTab("topup")}
                label="1. เติม Token"
              />
              <TabButton
                active={activeTab === "checkin"}
                onClick={() => setActiveTab("checkin")}
                label="2. สแกน QR เข้างาน"
              />
              <TabButton
                active={activeTab === "products"}
                onClick={() => setActiveTab("products")}
                label="3. ตั้งราคาสินค้า"
              />
              <TabButton
                active={activeTab === "pos"}
                onClick={() => setActiveTab("pos")}
                label="4. ร้านค้า (สแกน QR ลูกค้า)"
              />
            </div>
          </header>
        )}

        {/* พื้นที่แสดงผลตามเมนูที่เลือก */}
        <div className={section === "checkin" ? "h-full w-full" : "w-full"}>
          <div className={section === "checkin" ? "h-full w-full" : "w-full"}>
            {visibleTab === "topup" && (
              <TopUpTokenSection
                attendees={attendees}
                setAttendees={setAttendees}
                addLog={addLog}
                logs={logs}
              />
            )}
            {visibleTab === "checkin" && (
              <CheckInScanSection
                attendees={attendees}
                setAttendees={setAttendees}
                addLog={addLog}
              />
            )}
            {visibleTab === "products" && (
              <PricingContent
              />
            )}
            {visibleTab === "pos" && (
              <MerchantPosSection
                attendees={attendees}
                setAttendees={setAttendees}
                products={products}
                addLog={addLog}
              />
            )}
            {visibleTab === "store" && (
              <StoreDashboardSection
                logs={logs}
                addLog={addLog}
              />
            )}
            {visibleTab === "shop-scan" && (
              <StoreTokenScanSection
                attendees={attendees}
                setAttendees={setAttendees}
                addLog={addLog}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreDashboardSection({
  logs,
  addLog,
}: StoreDashboardProps) {
  const currentUser = getCurrentUser();
  const store =
    dashboardData.storeSales.find(
      (item) => item.adminEmail === currentUser?.email,
    ) ?? dashboardData.storeSales[0];
  const [storeProduct, setStoreProduct] = useState(store.product);
  const sales = logs.filter((log) => log.message.startsWith("ชำระเงินสำเร็จ"));
  const totalSales = sales.reduce((total, log) => {
    const amount = log.message.match(/จ่าย (\d+) Token/);
    return total + Number(amount?.[1] ?? 0);
  }, 0);

  return (
    <div className="w-full space-y-4">
      <header>
        <p className="text-xs font-semibold text-[#b18cff]">Admin ร้านค้า</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{store.name}</h2>
      </header>

      <section className="grid gap-3 sm:grid-cols-3 xl:max-w-5xl">
        <div className="rounded-xl border border-[#244466] bg-[#10233d] p-4">
          <p className="text-xs text-[#8fa6c2]">ยอดขายรวม (Token)</p>
          <p className="mt-2 text-2xl font-bold text-[#b18cff]">
            {(store.Sale + totalSales).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#244466] bg-[#10233d] p-4">
          <p className="text-xs text-[#8fa6c2]">จำนวนรายการขาย</p>
          <p className="mt-2 text-2xl font-bold text-[#49a5fb]">
            {store.salesCount + sales.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#244466] bg-[#10233d] p-4">
          <p className="text-xs text-[#8fa6c2]">สินค้าขายดี</p>
          <p className="mt-2 text-xl font-bold text-[#22d3b4]">
            {storeProduct.name}
          </p>
        </div>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
          <h3 className="mb-3 text-sm font-bold text-white">สินค้าของคุณ</h3>
          <div className="divide-y divide-[#244466]">
            <div className="grid grid-cols-[minmax(0,1fr)_84px_68px] items-center gap-3 py-2.5">
              <span className="truncate text-sm text-[#d6e0ed]">
                {storeProduct.name}
              </span>
              <label className="sr-only" htmlFor={`store-price-${store.id}`}>
                ราคาของ {storeProduct.name}
              </label>
              <input
                id={`store-price-${store.id}`}
                type="number"
                min="0"
                value={storeProduct.price}
                onChange={(event) =>
                  setStoreProduct((currentProduct) => ({
                    ...currentProduct,
                    price: Number(event.target.value),
                  }))
                }
                className="w-full rounded-md border border-[#244466] bg-[#0a1628] px-2 py-1.5 text-xs text-white outline-none focus:border-[#49a5fb]"
              />
              <button
                type="button"
                onClick={() =>
                  addLog(
                    `อัปเดตราคาสินค้า ${storeProduct.name}: ${storeProduct.price} Token`,
                  )
                }
                className="rounded-md bg-[#49a5fb] px-2 py-1.5 text-xs font-bold text-[#071426] hover:bg-[#368fdf]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-[#244466] bg-[#10233d] p-4">
          <h3 className="mb-3 text-sm font-bold text-white">รายการขายล่าสุด</h3>
          <div className="divide-y divide-[#244466]">
            {sales.length === 0
              ? ["14:50", "14:30", "14:27"].map((time) => (
                  <div
                    key={time}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-xs text-[#d6e0ed]">
                        {storeProduct.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[#7188a5]">{time}</p>
                    </div>
                    <span className="text-xs font-bold text-[#b18cff]">
                      {storeProduct.price}
                    </span>
                  </div>
                ))
              : sales.slice(0, 5).map((sale) => {
                  const amount = sale.message.match(/จ่าย (\d+) Token/);
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-xs text-[#d6e0ed]">ชำระเงินลูกค้า</p>
                        <p className="mt-1 text-[10px] text-[#7188a5]">
                          {sale.time}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#b18cff]">
                        {amount?.[1] ?? 0}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>
    </div>
  );
}

function StoreTokenScanSection({
  attendees,
  setAttendees,
  addLog,
}: AttendeeSectionProps) {
  const currentUser = getCurrentUser();
  const store =
    dashboardData.storeSales.find(
      (item) => item.adminEmail === currentUser?.email,
    ) ?? dashboardData.storeSales[0];
  const [customerQr, setCustomerQr] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const chargeAmount = 50;

  const handleScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = customerQr.trim().toUpperCase();
    const customer = attendees.find((attendee) => attendee.id === code);

    if (!customer) {
      setResult({ status: "error", message: `ไม่พบ QR ลูกค้า ${code || ""}` });
      addLog(`ชำระเงินล้มเหลว: ไม่พบ QR ลูกค้า ${code}`, "error");
      return;
    }
    if (customer.tokens < chargeAmount) {
      setResult({
        status: "error",
        message: `Token ของ ${customer.name} ไม่เพียงพอ`,
      });
      addLog(`ชำระเงินล้มเหลว: Token ไม่พอสำหรับ ${customer.name}`, "error");
      return;
    }

    setAttendees((previous) =>
      previous.map((attendee) =>
        attendee.id === customer.id
          ? { ...attendee, tokens: attendee.tokens - chargeAmount }
          : attendee,
      ),
    );
    setResult({
      status: "success",
      message: `ตัด Token จาก ${customer.name} แล้ว`,
    });
    addLog(`ชำระเงินสำเร็จ: ${customer.name} จ่าย ${chargeAmount} Token`);
    setCustomerQr("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <header className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold">สแกน QR TOKEN ของร้านค้า</h2>
        <p className="mt-1 text-sm text-[#8fa6c2]">
          สแกน QR จากหน้า Profile ลูกค้าเพื่อตัด Token ให้กับร้านค้า
        </p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 lg:grid-cols-[minmax(300px,0.95fr)_minmax(280px,0.8fr)]">
        <section className="flex flex-col rounded-2xl border border-[#244466] bg-[#10233d] p-4 sm:p-5">
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-[#244466] bg-[#0a1628] p-4">
            <MockQrCode />
          </div>
          <form onSubmit={handleScan} className="mt-3 space-y-2">
            <input
              type="text"
              value={customerQr}
              onChange={(event) => setCustomerQr(event.target.value)}
              placeholder="ยิงหรือกรอกรหัส QR ลูกค้า เช่น TKT-001"
              className="w-full rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-[#49a5fb] px-4 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#368fdf]"
            >
              สแกนและตัด {chargeAmount} Token
            </button>
          </form>
        </section>

        {result ? (
          <div
            className={`h-fit rounded-2xl border p-4 ${result.status === "success" ? "border-[#176848] bg-[#0d3028]" : "border-[#6b2b36] bg-[#351a27]"}`}
          >
            <p
              className={`text-sm font-bold ${result.status === "success" ? "text-[#63e6ae]" : "text-[#f4a3b0]"}`}
            >
              {result.status === "success"
                ? `✓ คุณได้รับ ${chargeAmount} Token`
                : "× สแกนไม่สำเร็จ"}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {store.name}
            </p>
            <p className="mt-2 text-xs text-[#8fa6c2]">{result.message}</p>
          </div>
        ) : (
          <div className="h-fit rounded-2xl border border-[#176848] bg-[#0d3028] p-4">
            <p className="text-sm font-bold text-[#63e6ae]">
              ✓ พร้อมรับการชำระเงิน
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {store.name}
            </p>
            <p className="mt-2 text-xs text-[#8fa6c2]">
              สแกน QR ลูกค้าเพื่อรับ 50 Token
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. หน้าร้านค้า สแกน QR ลูกค้าตัดยอด (MerchantPosSection)
// ==========================================
function MerchantPosSection({
  attendees,
  setAttendees,
  products,
  addLog,
}: MerchantPosProps) {
  const [cart, setCart] = useState<Record<string, number>>({}); // { productId: qty }
  const [customerQr, setCustomerQr] = useState("TKT-001");

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) next[productId] -= 1;
      else delete next[productId];
      return next;
    });
  };

  const totalTokens = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = products.find((p) => p.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (totalTokens === 0) return;
    const customer = attendees.find(
      (a) => a.id === customerQr.trim().toUpperCase(),
    );

    if (!customer) {
      addLog(`ชำระเงินล้มเหลว: ไม่พบ QR ลูกค้า ${customerQr}`, "error");
      return;
    }

    if (customer.tokens < totalTokens) {
      addLog(
        `ยอด Token ไม่พอ! ${customer.name} มี ${customer.tokens} TK (ต้องการ ${totalTokens} TK)`,
        "error",
      );
      alert(`ยอด Token ของลูกค้าไม่เพียงพอ (คงเหลือ ${customer.tokens} TK)`);
      return;
    }

    // ตัดยอด Token ลูกค้า
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === customer.id ? { ...a, tokens: a.tokens - totalTokens } : a,
      ),
    );
    addLog(
      `ชำระเงินสำเร็จ: ${customer.name} จ่าย ${totalTokens} Token (คงเหลือ ${
        customer.tokens - totalTokens
      } TK)`,
    );
    setCart({});
  };

  return (
    <div className="bg-[#10233d] p-6 rounded-2xl shadow-sm border border-[#244466]">
      <h2 className="text-xl font-bold mb-1">จุดขายสินค้า (POS ร้านค้า)</h2>
      <p className="text-sm text-[#8fa6c2] mb-6">
        เลือกสินค้าและสแกน QR Code ลูกค้าเพื่อตัดยอด Token
      </p>

      {/* รายการสินค้าให้กดเลือก */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => addToCart(product.id)}
            className="p-4 text-left border border-[#244466] rounded-xl hover:border-[#49a5fb] hover:bg-[#19395e]/40 transition"
          >
            <div className="font-semibold text-white">{product.name}</div>
            <div className="text-[#49a5fb] font-bold mt-1">
              {product.price} TK
            </div>
          </button>
        ))}
      </div>

      {/* ตะกร้าสินค้า */}
      <div className="p-4 bg-[#0f2038] rounded-xl border border-[#244466] mb-6">
        <h3 className="font-semibold text-sm mb-3">รายการที่เลือก</h3>
        {Object.keys(cart).length === 0 ? (
          <p className="text-xs text-[#7188a5]">ยังไม่ได้เลือกสินค้า</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(cart).map(([id, qty]) => {
              const item = products.find((p) => p.id === id);
              if (!item) return null;
              return (
                <div
                  key={id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {item.name} x {qty}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{item.price * qty} TK</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(id)}
                      className="px-2 py-0.5 bg-[#4c1d1d] text-[#fca5a5] rounded text-xs"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-[#244466] flex justify-between font-bold text-base">
              <span>ยอดรวมทั้งหมด</span>
              <span className="text-[#49a5fb]">{totalTokens} Token</span>
            </div>
          </div>
        )}
      </div>

      {/* ช่องสแกน QR ลูกค้าเพื่อจ่ายเงิน */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          สแกน QR Code ลูกค้าเพื่อรับชำระ
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customerQr}
            onChange={(e) => setCustomerQr(e.target.value)}
            placeholder="สแกน QR ลูกค้า เช่น TKT-001"
            className="flex-1 px-4 py-2.5 border border-[#355779] rounded-xl"
          />
          <select
            value={customerQr}
            onChange={(e) => setCustomerQr(e.target.value)}
            className="px-3 py-2.5 border border-[#355779] rounded-xl bg-[#0f2038] text-sm"
          >
            {attendees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} ({a.name} - {a.tokens} TK)
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={totalTokens === 0}
          onClick={handleCheckout}
          className="w-full py-3 bg-[#167d77] hover:bg-[#12665f] disabled:bg-[#355779] text-white font-semibold rounded-xl shadow-sm transition"
        >
          สแกนตัดยอดชำระเงิน ({totalTokens} Token)
        </button>
      </div>
    </div>
  );
}

// ==========================================
// UI Component เสริม
// ==========================================
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-[#49a5fb] text-white shadow-sm"
          : "bg-[#19395e] text-[#d6e0ed] hover:bg-[#244466]"
      }`}
    >
      {label}
    </button>
  );
}

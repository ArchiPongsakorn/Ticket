"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import CheckInScanSection from "@/components/admin/event-tokens/check-in-scan-section";
import TopUpTokenSection from "@/components/admin/event-tokens/top-up-token-section";
import PricingContent from "@/components/admin/pricing-content";
import type {
  AddLog,
  ActivityLog,
  Attendee,
} from "@/components/admin/event-tokens/types";
import { getCurrentUser } from "@/lib/local-auth";
import { recordAudit } from "@/lib/audit-log";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES, removeMockStores, type ManagedStore } from "@/lib/admin-stores";
import { readJSON, writeJSON } from "@/lib/storage";

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
  const [activeTab, setActiveTab] = usePersistentState("admin-event-active-tab", "topup");
  const visibleTab = section ?? activeTab;

  // State หลักของระบบ
  const [attendees, setAttendees] = usePersistentState<Attendee[]>("admin-event-attendees", INITIAL_ATTENDEES);
  const [products, setProducts] = usePersistentState<Product[]>("admin-event-products", INITIAL_PRODUCTS);
  const [logs, setLogs] = usePersistentState<ActivityLog[]>("admin-event-activity-logs", []);

  useEffect(() => {
    const refreshAttendees = (event: StorageEvent) => {
      if (event.key === "admin-event-attendees") {
        setAttendees(readJSON<Attendee[]>("admin-event-attendees", INITIAL_ATTENDEES));
      }
    };
    window.addEventListener("storage", refreshAttendees);
    return () => window.removeEventListener("storage", refreshAttendees);
  }, [setAttendees]);

  // Helper บันทึกประวัติการทำรายการ
  const addLog = (message: string, type = "info", auditAction = "Token/เข้างาน", sale?: { storeId: string; storeName: string; tokenAmount: number }) => {
    const time = new Date().toLocaleTimeString("th-TH");
    setLogs((prev) => [{ id: Date.now(), time, message, type, ...sale }, ...prev]);
    recordAudit(type === "error" ? `${auditAction}: เกิดข้อผิดพลาด` : auditAction, message);
  };

  return (
    <div
      className={`${section === "checkin" || section === "shop-scan" ? "h-svh overflow-hidden p-3" : "min-h-screen p-4 md:p-8"} bg-[#0a1628] font-sans text-[#d6e0ed]`}
    >
      <div className={section === "checkin" || section === "shop-scan" ? "h-full w-full" : "w-full"}>
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
        <div className={section === "checkin" || section === "shop-scan" ? "h-full w-full" : "w-full"}>
          <div className={section === "checkin" || section === "shop-scan" ? "h-full w-full" : "w-full"}>
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
  const [stores, setStores, storesReady] = usePersistentState<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES);
  const visibleStores = removeMockStores(stores);
  useEffect(() => {
    if (storesReady && visibleStores.length !== stores.length) setStores(visibleStores);
    const refresh = (event: StorageEvent) => {
      if (event.key === ADMIN_STORES_STORAGE_KEY) {
        setStores(removeMockStores(readJSON<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES)));
      }
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [setStores, stores.length, storesReady, visibleStores]);
  const store = visibleStores.find((item) => item.adminEmail.toLowerCase() === currentUser?.email.toLowerCase()) ?? (currentUser?.role === "merchant" ? undefined : visibleStores[0]);
  const [selectedStoreId, setSelectedStoreId] = usePersistentState("admin-current-store-id", "");
  const availableStores = currentUser?.role === "merchant"
    ? visibleStores.filter((item) => item.adminEmail.toLowerCase() === currentUser.email.toLowerCase())
    : visibleStores;
  const selectedStore = availableStores.find((item) => item.id === selectedStoreId) ?? store ?? availableStores[0];
  const [storeProduct, setStoreProduct] = useState({ name: "", price: 0 });
  const [productSaveMessage, setProductSaveMessage] = useState("");
  useEffect(() => {
    if (!selectedStore) {
      setStoreProduct({ name: "", price: 0 });
      return;
    }
    const saved = readJSON<{ name: string; price: number }>(
      `admin-store-product-${selectedStore.id}`,
      { name: selectedStore.product, price: 0 },
    );
    setStoreProduct({ ...saved, name: selectedStore.product });
  }, [selectedStore?.id, selectedStore?.product]);
  const sales = logs.filter((log) => log.storeId === selectedStore?.id && log.tokenAmount !== undefined);
  const totalSales = sales.reduce((total, log) => {
    const amount = log.message.match(/จ่าย (\d+) Token/);
    return total + Number(amount?.[1] ?? 0);
  }, 0);

  if (!selectedStore) {
    return <div className="rounded-2xl border border-[#244466] bg-[#10233d] p-5 text-sm text-[#8fa6c2]">ยังไม่มีร้านค้าที่ผูกกับบัญชีนี้</div>;
  }

  return (
    <div className="w-full space-y-4">
      <header>
        <p className="text-xs font-semibold text-[#b18cff]">{currentUser?.role === "merchant" ? "Merchant · ร้านค้าของฉัน" : "Admin · ร้านค้า"}</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedStore.name}</h2>
        {availableStores.length > 0 && (
          <label className="mt-3 block max-w-sm text-xs text-[#8fa6c2]">
            เลือกร้านค้า
            <select
              value={selectedStore.id}
              onChange={(event) => setSelectedStoreId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]"
            >
              {availableStores.map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {item.adminEmail}</option>
              ))}
            </select>
          </label>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-3 xl:max-w-5xl">
        <div className="rounded-xl border border-[#244466] bg-[#10233d] p-4">
          <p className="text-xs text-[#8fa6c2]">ยอดขายรวม (Token)</p>
          <p className="mt-2 text-2xl font-bold text-[#b18cff]">
            {totalSales.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#244466] bg-[#10233d] p-4">
          <p className="text-xs text-[#8fa6c2]">จำนวนรายการขาย</p>
          <p className="mt-2 text-2xl font-bold text-[#49a5fb]">
            {sales.length}
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
              <label className="sr-only" htmlFor={`store-price-${selectedStore.id}`}>
                ราคาของ {storeProduct.name}
              </label>
              <input
                id={`store-price-${selectedStore.id}`}
                type="number"
                min="0"
                value={storeProduct.price}
                onChange={(event) => {
                  const nextProduct = { ...storeProduct, price: Number(event.target.value) };
                  setStoreProduct(nextProduct);
                setProductSaveMessage("");
                }}
                className="w-full rounded-md border border-[#244466] bg-[#0a1628] px-2 py-1.5 text-xs text-white outline-none focus:border-[#49a5fb]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!Number.isFinite(storeProduct.price) || storeProduct.price < 0) {
                    setProductSaveMessage("กรุณาระบุราคาเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
                    return;
                  }
                  const key = `admin-store-product-${selectedStore.id}`;
                  const savedProduct = { ...storeProduct, price: Math.floor(storeProduct.price) };
                  try {
                    window.localStorage.setItem(key, JSON.stringify(savedProduct));
                    setStoreProduct(savedProduct);
                    setProductSaveMessage("บันทึกราคาแล้ว");
                    addLog(`อัปเดตราคาสินค้า ${savedProduct.name}: ${savedProduct.price} Token`);
                  } catch {
                    setProductSaveMessage("บันทึกไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์");
                  }
                }}
                className="rounded-md bg-[#49a5fb] px-2 py-1.5 text-xs font-bold text-[#071426] hover:bg-[#368fdf]"
              >
                บันทึก
              </button>
            </div>
            {productSaveMessage && (
              <p role="status" className={`pt-2 text-xs ${productSaveMessage === "บันทึกราคาแล้ว" ? "text-[#22d3b4]" : "text-[#ff7b85]"}`}>
                {productSaveMessage}
              </p>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-[#244466] bg-[#10233d] p-4">
          <h3 className="mb-3 text-sm font-bold text-white">รายการขายล่าสุด</h3>
          <div className="divide-y divide-[#244466]">
            {sales.length === 0
              ? <p className="py-3 text-xs text-[#7188a5]">ยังไม่มีรายการขาย</p>
              : sales.slice(0, 5).map((sale) => {
                  const amount = sale.tokenAmount;
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
                        {amount ?? 0}
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
  const [stores, setStores, storesReady] = usePersistentState<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES);
  const visibleStores = removeMockStores(stores);
  useEffect(() => {
    if (storesReady && visibleStores.length !== stores.length) setStores(visibleStores);
    const refresh = (event: StorageEvent) => {
      if (event.key === ADMIN_STORES_STORAGE_KEY) {
        setStores(removeMockStores(readJSON<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES)));
      }
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [setStores, stores.length, storesReady, visibleStores]);
  const [selectedStoreId, setSelectedStoreId] = usePersistentState("admin-current-store-id", "");
  const availableStores = currentUser?.role === "merchant"
    ? visibleStores.filter((item) => item.adminEmail.toLowerCase() === currentUser.email.toLowerCase())
    : visibleStores;
  const defaultStore = currentUser?.role === "merchant"
    ? availableStores[0]
    : availableStores.find((item) => item.adminEmail.toLowerCase() === currentUser?.email.toLowerCase()) ?? availableStores[0];
  const store = availableStores.find((item) => item.id === selectedStoreId) ?? defaultStore;
  const [storeProduct, setStoreProduct] = useState<{ name: string; price: number } | null>(null);
  useEffect(() => {
    if (!store) {
      setStoreProduct(null);
      return;
    }
    const savedProduct = readJSON<{ name?: string; price?: number } | null>(
      `admin-store-product-${store.id}`,
      null,
    );
    setStoreProduct({
      name: savedProduct?.name || store.product,
      price: Number.isFinite(savedProduct?.price) && Number(savedProduct?.price) >= 0
        ? Number(savedProduct?.price)
        : 50,
    });
  }, [store?.id, store?.product]);
  const [customerQr, setCustomerQr] = usePersistentState("admin-store-scan-qr", "");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScanRef = useRef("");
  const handleScanRef = useRef<(code: string) => void>(() => {});
  const chargeAmount = storeProduct?.price ?? 50;
  const profileTokenTickets = attendees.filter((attendee) => attendee.active === true && attendee.tokens > 0);

  const handleScan = (rawCode = customerQr) => {
    const code = rawCode.trim().toUpperCase();
    const customer = attendees.find((attendee) => attendee.id === code);

    if (!store) {
      setResult({ status: "error", message: "ยังไม่มีร้านค้าที่พร้อมรับชำระ Token" });
      return;
    }

    if (!customer) {
      setResult({ status: "error", message: `ไม่พบ QR ลูกค้า ${code || ""}` });
      addLog(`ชำระเงินล้มเหลว: ไม่พบ QR ลูกค้า ${code}`, "error");
      return;
    }
    if (customer.active !== true) {
      setResult({ status: "error", message: `บัตรของ ${customer.name} ยังไม่ได้รับอนุมัติ จึงยังใช้ Token ไม่ได้` });
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
    addLog(`ชำระเงินสำเร็จ: ${customer.name} จ่าย ${chargeAmount} Token`, "info", undefined, {
      storeId: store?.id ?? "",
      storeName: store?.name ?? "",
      tokenAmount: chargeAmount,
    });
    setCustomerQr("");
  };

  handleScanRef.current = handleScan;

  useEffect(() => {
    let active = true;
    let controls: { stop: () => void } | undefined;
    const reader = new BrowserQRCodeReader();
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("การใช้กล้องต้องเปิดหน้าเว็บผ่าน HTTPS หรือ localhost");
        }
        const video = videoRef.current;
        if (!video) return;
        controls = await reader.decodeFromVideoDevice(undefined, video, (result, error, scannerControls) => {
          controls = scannerControls;
          if (!result) {
            if (error?.name === "NotFoundException") lastScanRef.current = "";
            return;
          }
          const code = result.getText().trim();
          if (!code || code === lastScanRef.current) return;
          lastScanRef.current = code;
          setCustomerQr(code);
          handleScanRef.current(code);
        });
        if (!active) controls?.stop();
      } catch (error) {
        if (active) setCameraError(error instanceof Error ? error.message : "เปิดกล้องไม่สำเร็จ");
      }
    };
    void startCamera();
    return () => {
      active = false;
      controls?.stop();
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <header className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold">สแกน QR TOKEN ของร้านค้า</h2>
        <p className="mt-1 text-sm text-[#8fa6c2]">
          สแกน QR จากหน้า Profile ลูกค้าเพื่อตัด Token ให้กับร้านค้า
        </p>
        {currentUser?.role !== "merchant" && availableStores.length > 1 && (
          <label className="mt-3 block max-w-sm text-xs text-[#8fa6c2]">ร้านค้าที่รับชำระ
            <select value={store?.id ?? ""} onChange={(event) => setSelectedStoreId(event.target.value)} className="mt-1 w-full rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]">
              {availableStores.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        )}
        {store && storeProduct && (
          <p className="mt-2 text-xs text-[#8fa6c2]">
            คิดค่า {storeProduct.name} {chargeAmount.toLocaleString()} Token ต่อรายการ
          </p>
        )}
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <section className="flex min-h-0 flex-col rounded-2xl border border-[#244466] bg-[#10233d] p-4 sm:p-5">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-[#244466] bg-[#0a1628] p-4">
            <video ref={videoRef} className="max-h-full w-full rounded-lg object-cover" playsInline muted aria-label="ภาพจากกล้องสำหรับสแกน QR ลูกค้า" />
            <p className="mt-3 text-center text-xs text-[#8fa6c2]">เล็งกล้องไปที่ QR ลูกค้าเพื่อหัก {chargeAmount} Token</p>
            {cameraError && <p role="alert" className="mt-2 text-center text-sm text-[#f4a3b0]">{cameraError}</p>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); handleScan(); }} className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customerQr}
              onChange={(event) => setCustomerQr(event.target.value)}
              list="profile-token-ticket-codes"
              placeholder="ยิงหรือกรอกรหัส QR ลูกค้า เช่น TKT-001"
              className="min-w-0 flex-1 rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
            />
            <datalist id="profile-token-ticket-codes">
              {profileTokenTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id} label={`${ticket.name} · ${ticket.tokens} Token`} />
              ))}
            </datalist>
            <button
              type="submit"
              className="rounded-lg bg-[#49a5fb] px-5 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#368fdf]"
            >
              สแกนและตัดโทเคน
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
              {store?.name ?? "ร้านค้า"}
            </p>
            <p className="mt-2 text-xs text-[#8fa6c2]">{result.message}</p>
          </div>
        ) : (
          <div className="h-fit rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <p className="text-sm font-semibold text-[#d6e0ed]">รอสแกน QR ลูกค้า</p>
            <p className="mt-2 text-xs text-[#8fa6c2]">ผลการตัด Token จะแสดงที่นี่เมื่อทำรายการสำเร็จ</p>
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
  const [cart, setCart] = usePersistentState<Record<string, number>>("admin-pos-cart", {});
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
    const currentUser = getCurrentUser();
    const managedStores = removeMockStores(readJSON<ManagedStore[]>(ADMIN_STORES_STORAGE_KEY, INITIAL_MANAGED_STORES));
    const saleStore = managedStores.find((managedStore) => managedStore.adminEmail.toLowerCase() === currentUser?.email.toLowerCase()) ?? managedStores[0];
    addLog(
      `ชำระเงินสำเร็จ: ${customer.name} จ่าย ${totalTokens} Token (คงเหลือ ${
        customer.tokens - totalTokens
      } TK)`,
      "info",
      undefined,
      saleStore ? { storeId: saleStore.id, storeName: saleStore.name, tokenAmount: totalTokens } : undefined,
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

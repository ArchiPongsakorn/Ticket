"use client";

import { useEffect, useState } from "react";
import { CATALOG } from "@/data/catalog";

const PRICE_STORAGE_KEY = "admin-catalog-prices";
const DEFAULT_PRICES = Object.fromEntries(
  CATALOG.map((item) => [item.id, item.price]),
);

type PriceLog = {
  id: string;
  message: string;
  time: string;
};

export default function PricingContent() {
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [savedPrices, setSavedPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [priceLogs, setPriceLogs] = useState<PriceLog[]>(() =>
    CATALOG.map((item) => ({
      id: `initial-${item.id}`,
      message: `${item.name} ตั้งราคาเริ่มต้น [${item.price} บาท]`,
      time: "ข้อมูลเริ่มต้น",
    })),
  );

  useEffect(() => {
    const savedPrices = window.localStorage.getItem(PRICE_STORAGE_KEY);
    if (!savedPrices) return;

    try {
      const parsedPrices = JSON.parse(savedPrices) as Record<string, number>;
      setPrices((currentPrices) => ({ ...currentPrices, ...parsedPrices }));
      setSavedPrices((currentPrices) => ({ ...currentPrices, ...parsedPrices }));
    } catch {
      window.localStorage.removeItem(PRICE_STORAGE_KEY);
    }
  }, []);

  const handlePriceChange = (id: string, value: string) => {
    const nextPrice = Number(value);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) return;

    setPrices((currentPrices) => ({ ...currentPrices, [id]: nextPrice }));
    setSavedItemId(null);
  };

  const handleSavePrice = (id: string, name: string) => {
    const previousPrice = savedPrices[id];
    const nextPrice = prices[id];
    const nextSavedPrices = { ...savedPrices, [id]: nextPrice };

    window.localStorage.setItem(
      PRICE_STORAGE_KEY,
      JSON.stringify(nextSavedPrices),
    );
    setSavedPrices(nextSavedPrices);
    setSavedItemId(id);
    setPriceLogs((currentLogs) => [
      {
        id: `${id}-${Date.now()}`,
        message: `${name} [${previousPrice} บาท] → [${nextPrice} บาท]`,
        time: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...currentLogs,
    ]);
  };

  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] px-5 py-6 text-[#d6e0ed] sm:px-7 lg:px-8">
      <div className="w-full max-w-6xl">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ตั้งราคา
          </h1>
          <p className="mt-1 text-xs text-[#8fa6c2]">
            กำหนดราคาสินค้าจาก Catalog พร้อมข้อมูล Log ตัวอย่าง
          </p>
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">ราคาปัจจุบัน</h2>

            <div className="grid grid-cols-[1.2fr_0.8fr_1fr_100px] items-center border-b border-[#244466] px-2 pb-2 text-[10px] text-[#8fa6c2]">
              <span>สินค้า</span>
              <span>ราคาเดิม (บาท)</span>
              <span>ราคาใหม่ (บาท)</span>
              <span />
            </div>

            <div className="divide-y divide-[#244466]">
              {CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1.2fr_0.8fr_1fr_100px] items-center gap-2 px-2 py-2"
                >
                  <span className="text-xs text-white">{item.name}</span>
                  <span className="text-xs text-[#8fa6c2]">
                    {item.price.toLocaleString("th-TH")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={prices[item.id]}
                    onChange={(event) =>
                      handlePriceChange(item.id, event.target.value)
                    }
                    className="w-full max-w-18.5 rounded-md border border-[#355779] bg-[#08182c] px-2 py-1.5 text-xs text-white outline-none focus:border-[#49a5fb]"
                    aria-label={`ราคาใหม่ ${item.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSavePrice(item.id, item.name)}
                    className="w-full rounded-lg bg-[#49a5fb] px-3 py-2 text-[11px] font-semibold text-[#071426] transition-colors hover:bg-[#368fdf]"
                  >
                    {savedItemId === item.id ? "บันทึกแล้ว" : "บันทึก"}
                  </button>
                </div>
              ))}
            </div>

          </section>

          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">Log การแก้ราคา</h2>
            <div className="border-t border-[#244466]">
              {priceLogs.map((log) => (
                <div
                  key={log.id}
                  className="border-b border-[#244466] py-2 text-[11px] text-white"
                >
                  <p>{log.message}</p>
                  <p className="mt-1 text-[9px] text-[#8fa6c2]">
                    Admin · {log.time}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

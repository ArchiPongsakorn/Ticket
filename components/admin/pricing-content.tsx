"use client";

import { CATALOG } from "@/data/catalog";

export default function PricingContent() {
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">ราคาปัจจุบัน</h2>

            <div className="grid grid-cols-[1.2fr_0.8fr_1fr] items-center border-b border-[#244466] px-2 pb-2 text-[10px] text-[#8fa6c2]">
              <span>สินค้า</span>
              <span>ราคาเดิม (บาท)</span>
              <span>ราคาใหม่ (บาท)</span>
            </div>

            <div className="divide-y divide-[#244466]">
              {CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1.2fr_0.8fr_1fr] items-center gap-2 px-2 py-2"
                >
                  <span className="text-xs text-white">{item.name}</span>
                  <span className="text-xs text-[#8fa6c2]">
                    {item.price.toLocaleString("th-TH")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    readOnly
                    className="w-full max-w-18.5 rounded-md border border-[#355779] bg-[#08182c] px-2 py-1.5 text-xs text-white outline-none focus:border-[#49a5fb]"
                    aria-label={`ราคาใหม่ ${item.name}`}
                  />
                </div>
              ))}
            </div>

          </section>

          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">Log การแก้ราคา</h2>
            <div className="border-t border-[#244466]">
              {CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#244466] py-2 text-[11px] text-white"
                >
                  <p>
                    {item.name} ตั้งราคาเริ่มต้น [{item.price} บาท]
                  </p>
                  <p className="mt-1 text-[9px] text-[#8fa6c2]">Admin · [เวลา]</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

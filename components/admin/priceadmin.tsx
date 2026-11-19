"use client";

import { Plus } from "lucide-react";
import { CATALOG } from "../../data/catalog";
import type { Product } from "../../types/domain";

export default function PriceAdmin() {
  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] p-5 text-white sm:p-8">
      <div className="mx-0 max-w-5xl">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">ตั้งราคา</h1>
        <p className="mt-2 text-xs text-[#8fa6c2] sm:text-sm">
          กำหนดราคาบัตรและเสื้อ
        </p>

        <section className="mt-5 overflow-hidden rounded-xl border border-[#29496b] bg-[#102641]">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-white">ราคาปัจจุบัน</h2>
            <button
              type="button"
              className="inline-flex h-8 w-27.5 items-center justify-center gap-1.5 rounded-md bg-[#49a5fb] px-3 text-xs font-semibold text-[#071a31] transition-colors hover:bg-[#70b9ff]"
            >
              <Plus size={14} strokeWidth={2.5} />เพิ่มสินค้า</button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-140">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_110px] items-center border-b border-[#29496b] px-4 py-2 text-[10px] text-[#9bb2ce] sm:px-5 sm:text-xs">
                <span>สินค้า</span>
                <span>ราคาเดิม (บาท)</span>
                <span>ราคาใหม่ (บาท)</span>
                <span />
              </div>

              {CATALOG.map((product) => (
                <PriceRow key={product.id} product={product} />
              ))}
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

function PriceRow({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr_110px] items-center border-b border-[#29496b] px-4 py-2.5 last:border-b-0 sm:px-5">
      <span className="text-xs text-white sm:text-sm">{product.name}</span>
      <span className="text-xs text-[#9bb2ce] sm:text-sm">
        {product.was ?? product.price}
      </span>
      <input
        type="number"
        min="0"
        defaultValue={product.price}
        aria-label={`ราคาใหม่ของ${product.name}`}
        className="h-8 w-16.5 rounded-md border border-[#29496b] bg-[#081a31] px-2 text-xs text-white outline-none transition-colors focus:border-[#49a5fb] sm:w-19.5"
      />
      <button
        type="button"
        className="h-8 w-27.5 justify-self-end rounded-md bg-[#49a5fb] text-xs font-semibold text-[#071a31] transition-colors hover:bg-[#70b9ff]"
      >
        บันทึกราคา
      </button>
    </div>
  );
}

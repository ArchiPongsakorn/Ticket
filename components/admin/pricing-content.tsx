"use client";

import { useEffect, useState } from "react";
import { CATALOG } from "@/data/catalog";
import type { Product, ProductKind } from "@/types/domain";
import { CATALOG_CHANGED_EVENT, readCatalog, saveCatalog } from "@/lib/catalog-storage";
import { notifyCatalogPricesChanged, PRICE_STORAGE_KEY } from "@/hooks/useCatalogPrices";
import { recordAudit } from "@/lib/audit-log";

const PRICE_LOG_STORAGE_KEY = "admin-catalog-price-logs";
const DEFAULT_PRICES = Object.fromEntries(CATALOG.map((item) => [item.id, item.price]));

type PriceLog = { id: string; message: string; time: string };
type ProductDraft = { glyph: string; image: string; desc: string; perks: string; tokens: string; max: string; optionLabel: string; options: string };

export default function PricingContent() {
  const [catalog, setCatalog] = useState<Product[]>(CATALOG);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(DEFAULT_PRICES).map(([id, price]) => [id, String(price)])),
  );
  const [savedPrices, setSavedPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [priceLogs, setPriceLogs] = useState<PriceLog[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ProductKind>("ticket");
  const [newPrice, setNewPrice] = useState("");
  const [message, setMessage] = useState("");
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>({ glyph: "", image: "", desc: "", perks: "", tokens: "", max: "", optionLabel: "", options: "" });

  useEffect(() => {
    const refresh = () => {
      const currentCatalog = readCatalog();
      let prices: Record<string, number> = {};
      let logs: PriceLog[] = [];
      try {
        prices = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY) ?? "{}");
        logs = JSON.parse(localStorage.getItem(PRICE_LOG_STORAGE_KEY) ?? "[]");
      } catch {
        prices = {};
        logs = [];
      }
      setCatalog(currentCatalog);
      setSavedPrices({ ...Object.fromEntries(currentCatalog.map((item) => [item.id, item.price])), ...prices });
      setPriceInputs(Object.fromEntries(currentCatalog.map((item) => [item.id, String(prices[item.id] ?? item.price)])));
      setPriceLogs(Array.isArray(logs) ? logs : []);
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CATALOG_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CATALOG_CHANGED_EVENT, refresh);
    };
  }, []);

  const handleSavePrice = (item: Product) => {
    const rawPrice = priceInputs[item.id]?.trim() ?? "";
    const nextPrice = Number(rawPrice);
    if (!rawPrice || !Number.isFinite(nextPrice) || nextPrice < 0) {
      setMessage("กรุณากรอกราคาเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป");
      return;
    }

    const previousPrice = savedPrices[item.id] ?? item.price;
    const nextPrices = { ...savedPrices, [item.id]: nextPrice };
    try {
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(nextPrices));
    } catch {
      setMessage("บันทึกราคาไม่ได้ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์");
      return;
    }

    setSavedPrices(nextPrices);
    setSavedItemId(item.id);
    setMessage("");
    notifyCatalogPricesChanged();
    recordAudit("เปลี่ยนราคา", `${item.name}: ${previousPrice} → ${nextPrice} บาท`);
    const nextLogs = [
      { id: `${item.id}-${Date.now()}`, message: `${item.name} [${previousPrice} บาท] → [${nextPrice} บาท]`, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) },
      ...priceLogs,
    ];
    setPriceLogs(nextLogs);
    localStorage.setItem(PRICE_LOG_STORAGE_KEY, JSON.stringify(nextLogs));
  };

  const handleAddProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name || !newPrice.trim() || !Number.isFinite(price) || price < 0) {
      setMessage("กรอกชื่อสินค้าและราคาที่ถูกต้องก่อนเพิ่มสินค้า");
      return;
    }
    if (catalog.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setMessage("มีสินค้าชื่อนี้อยู่แล้ว");
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-|-$/g, "") || "product";
    const id = `custom-${slug}-${Date.now()}`;
    const product: Product = {
      id,
      type: newType,
      name,
      desc: "",
      price,
      glyph: newType === "ticket" ? "TKT" : "ITEM",
      max: 10,
      ...(newType === "ticket" ? { tokens: 0 } : {}),
    };
    const nextCatalog = [...catalog, product];
    try {
      saveCatalog(nextCatalog);
      const nextPrices = { ...savedPrices, [id]: price };
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(nextPrices));
      setCatalog(nextCatalog);
      setSavedPrices(nextPrices);
      setPriceInputs((current) => ({ ...current, [id]: String(price) }));
      setNewName("");
      setNewPrice("");
      setMessage("เพิ่มสินค้าแล้ว และจะแสดงในหน้าซื้อของทันที");
      recordAudit("เพิ่มสินค้า", `${name} · ${newType === "ticket" ? "บัตร" : "ของที่ระลึก"} · ${price} บาท`);
    } catch {
      setMessage("บันทึกสินค้าไม่ได้ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์");
    }
  };

  const handleDeleteProduct = (item: Product) => {
    if (!window.confirm(`ต้องการลบสินค้า “${item.name}” ใช่หรือไม่?`)) return;
    const nextCatalog = catalog.filter((product) => product.id !== item.id);
    const nextPrices = { ...savedPrices };
    delete nextPrices[item.id];
    try {
      saveCatalog(nextCatalog);
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(nextPrices));
      setCatalog(nextCatalog);
      setSavedPrices(nextPrices);
      setPriceInputs((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setMessage("ลบสินค้าแล้ว และนำออกจากหน้าซื้อของแล้ว");
      recordAudit("ลบสินค้า", item.name);
    } catch {
      setMessage("ลบสินค้าไม่ได้ กรุณาลองอีกครั้ง");
    }
  };

  const openProductEditor = (item: Product) => {
    setEditingProduct(item);
    setProductDraft({ glyph: item.glyph ?? "", image: item.image ?? "", desc: item.desc ?? "", perks: item.perks?.join("\n") ?? "", tokens: String(item.tokens ?? 0), max: String(item.max ?? 10), optionLabel: item.optionLabel ?? "", options: item.options?.join(", ") ?? "" });
  };

  const handleProductImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("รูปภาพต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setMessage("อ่านไฟล์รูปภาพไม่สำเร็จ");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setMessage("เปิดไฟล์รูปภาพไม่สำเร็จ");
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        setProductDraft((draft) => ({ ...draft, image: canvas.toDataURL("image/jpeg", 0.82) }));
        setMessage("");
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct) return;
    const tokens = Number(productDraft.tokens);
    const max = Number(productDraft.max);
    if (!Number.isInteger(tokens) || tokens < 0 || !Number.isInteger(max) || max < 1) {
      setMessage("Token ต้องเป็นจำนวนเต็มตั้งแต่ 0 และจำนวนซื้อต้องมากกว่า 0");
      return;
    }
    const perks = productDraft.perks.split("\n").map((value) => value.trim()).filter(Boolean);
    const options = productDraft.options.split(",").map((value) => value.trim()).filter(Boolean);
    const updatedProduct: Product = {
      ...editingProduct,
      glyph: productDraft.glyph.trim().slice(0, 10) || editingProduct.glyph,
      image: productDraft.image || undefined,
      desc: productDraft.desc.trim(),
      perks: perks.length ? perks : undefined,
      tokens: editingProduct.type === "ticket" ? tokens : undefined,
      max,
      optionLabel: options.length ? (productDraft.optionLabel.trim() || "ตัวเลือก") : undefined,
      options: options.length ? options : undefined,
    };
    const nextCatalog = catalog.map((item) => item.id === editingProduct.id ? updatedProduct : item);
    try {
      saveCatalog(nextCatalog);
      setCatalog(nextCatalog);
      setEditingProduct(null);
      setMessage("บันทึกรายละเอียดแล้ว และอัปเดตหน้าซื้อของแล้ว");
      recordAudit("แก้ไขรายละเอียดสินค้า", editingProduct.name);
    } catch {
      setMessage("บันทึกรายละเอียดสินค้าไม่ได้ กรุณาลองอีกครั้ง");
    }
  };

  return (
    <main className="min-h-svh min-w-0 flex-1 overflow-y-auto bg-[#0a1628] px-5 py-6 text-[#d6e0ed] sm:px-7 lg:px-8">
      <div className="w-full max-w-6xl">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-white">แก้ไขสินค้า</h1>
          <p className="mt-1 text-xs text-[#8fa6c2]">สินค้าและราคาที่บันทึกจะแสดงในหน้าซื้อของทันที</p>
        </header>

        <form onSubmit={handleAddProduct} className="mb-5 grid gap-3 rounded-2xl border border-[#244466] bg-[#10233d] p-4 sm:grid-cols-[minmax(0,1fr)_150px_130px_auto] sm:items-end">
          <label className="text-xs text-[#8fa6c2]">ชื่อสินค้า
            <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="เช่น บัตร Early Bird" className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]" />
          </label>
          <label className="text-xs text-[#8fa6c2]">ประเภท
            <select value={newType} onChange={(event) => setNewType(event.target.value as ProductKind)} className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]"><option value="ticket">บัตรเข้างาน</option><option value="merch">ของที่ระลึก</option></select>
          </label>
          <label className="text-xs text-[#8fa6c2]">ราคา (บาท)
            <input type="number" min="0" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} placeholder="0" className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]" />
          </label>
          <button type="submit" className="rounded-lg bg-[#49a5fb] px-4 py-2 text-sm font-semibold text-[#071426] hover:bg-[#368fdf]">เพิ่มสินค้า</button>
        </form>

        {message && <p role="status" className="mb-4 text-sm text-[#8fc8ff]">{message}</p>}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">รายการสินค้าและราคา</h2>
            <div className="grid grid-cols-[minmax(0,1fr)_90px_100px_84px] items-center border-b border-[#244466] px-2 pb-2 text-[10px] text-[#8fa6c2] sm:grid-cols-[minmax(0,1fr)_120px_110px_100px_84px]">
              <span>สินค้า</span><span className="hidden sm:block">ประเภท</span><span>ราคา (บาท)</span><span>บันทึก</span><span />
            </div>
            <div className="divide-y divide-[#244466]">
              {catalog.map((item) => (
                <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_90px_100px_84px] items-center gap-2 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_120px_110px_100px_84px]">
                  <span className="truncate text-xs text-white">{item.name}</span>
                  <span className="hidden text-xs text-[#8fa6c2] sm:block">{item.type === "ticket" ? "บัตร" : "ของที่ระลึก"}</span>
                  <input type="number" min="0" value={priceInputs[item.id] ?? String(item.price)} onChange={(event) => { setPriceInputs((current) => ({ ...current, [item.id]: event.target.value })); setSavedItemId(null); }} className="w-full rounded-md border border-[#355779] bg-[#08182c] px-2 py-1.5 text-xs text-white outline-none focus:border-[#49a5fb]" aria-label={`ราคา ${item.name}`} />
                  <button type="button" onClick={() => handleSavePrice(item)} className="w-full rounded-lg bg-[#49a5fb] px-2 py-2 text-[11px] font-semibold text-[#071426] hover:bg-[#368fdf]">{savedItemId === item.id ? "บันทึกแล้ว" : "บันทึก"}</button>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openProductEditor(item)} className="rounded-lg border border-[#49a5fb]/50 px-2 py-2 text-[11px] text-[#8fc8ff] hover:bg-[#1e416a]">รายละเอียด</button>
                    <button type="button" onClick={() => handleDeleteProduct(item)} className="rounded-lg border border-red-500/40 px-2 py-2 text-[11px] text-red-300 hover:bg-red-500 hover:text-white">ลบ</button>
                  </div>
                </div>
              ))}
              {catalog.length === 0 && <p className="py-6 text-center text-sm text-[#8fa6c2]">ยังไม่มีสินค้า เพิ่มสินค้าได้จากแบบฟอร์มด้านบน</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-4">
            <h2 className="mb-3 text-sm font-bold text-white">Log การแก้ไข</h2>
            <div className="border-t border-[#244466]">
              {priceLogs.map((log) => <div key={log.id} className="border-b border-[#244466] py-2 text-[11px] text-white"><p>{log.message}</p><p className="mt-1 text-[9px] text-[#8fa6c2]">Admin · {log.time}</p></div>)}
              {priceLogs.length === 0 && <p className="py-4 text-xs text-[#8fa6c2]">ยังไม่มีประวัติการแก้ไข</p>}
            </div>
          </section>
        </div>
      </div>
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingProduct(null); }}>
          <form onSubmit={handleSaveDetails} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-[#2b4c70] bg-[#10233d] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs text-[#8fa6c2]">แก้ไขรายละเอียดสินค้า</p><h2 className="mt-1 text-xl font-bold text-white">{editingProduct.name}</h2></div>
              <button type="button" onClick={() => setEditingProduct(null)} className="rounded-lg px-3 py-1 text-sm text-[#9db0c7] hover:bg-[#1e3654]" aria-label="ปิด">✕</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[#d6e0ed]">ตัวย่อบนการ์ด (ไม่เกิน 10 ตัว)
                <input maxLength={10} value={productDraft.glyph} onChange={(event) => setProductDraft((draft) => ({ ...draft, glyph: event.target.value }))} placeholder="เช่น VIP" className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]" />
              </label>
              <div className="text-sm text-[#d6e0ed]">รูปภาพสินค้า
                <label className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#49a5fb]/60 bg-[#08182c] px-3 py-2 text-sm text-[#8fc8ff] hover:bg-[#122843]">
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleProductImage(event.target.files?.[0])} />
                  {productDraft.image ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพ (สูงสุด 5 MB)"}
                </label>
                {productDraft.image && <button type="button" onClick={() => setProductDraft((draft) => ({ ...draft, image: "" }))} className="mt-1 text-xs text-red-300 hover:text-red-200">นำรูปออก ใช้ตัวย่อแทน</button>}
              </div>
            </div>
            <label className="block text-sm text-[#d6e0ed]">คำอธิบายสินค้า
              <textarea rows={3} value={productDraft.desc} onChange={(event) => setProductDraft((draft) => ({ ...draft, desc: event.target.value }))} placeholder="เช่น เข้างานได้ 1 วัน พร้อมสิทธิ์..." className="mt-1 w-full resize-y rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]" />
            </label>
            <label className="block text-sm text-[#d6e0ed]">สิทธิประโยชน์ (แยกบรรทัดละ 1 ข้อ)
              <textarea rows={3} value={productDraft.perks} onChange={(event) => setProductDraft((draft) => ({ ...draft, perks: event.target.value }))} placeholder={'เข้างานได้ 1 วัน\nรับโบนัส Token 300 Token'} className="mt-1 w-full resize-y rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {editingProduct.type === "ticket" && <label className="text-sm text-[#d6e0ed]">โบนัส Token<input type="number" min="0" step="1" value={productDraft.tokens} onChange={(event) => setProductDraft((draft) => ({ ...draft, tokens: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]" /></label>}
              <label className="text-sm text-[#d6e0ed]">จำนวนซื้อสูงสุดต่อคำสั่งซื้อ<input type="number" min="1" step="1" value={productDraft.max} onChange={(event) => setProductDraft((draft) => ({ ...draft, max: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none focus:border-[#49a5fb]" /></label>
              <label className="text-sm text-[#d6e0ed] sm:col-span-2">ตัวเลือกสินค้า (คั่นด้วยจุลภาค เช่น S, M, L)
                <input value={productDraft.options} onChange={(event) => setProductDraft((draft) => ({ ...draft, options: event.target.value }))} placeholder="เว้นว่างถ้าไม่มีตัวเลือก" className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]" />
              </label>
              {productDraft.options.trim() && <label className="text-sm text-[#d6e0ed] sm:col-span-2">ชื่อหัวข้อตัวเลือก<input value={productDraft.optionLabel} onChange={(event) => setProductDraft((draft) => ({ ...draft, optionLabel: event.target.value }))} placeholder="เช่น ไซซ์" className="mt-1 w-full rounded-lg border border-[#355779] bg-[#08182c] px-3 py-2 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]" /></label>}
            </div>
            <section className="rounded-xl border border-[#244466] bg-[#0a1628] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8fa6c2]">ตัวอย่างบนหน้าซื้อของ</p>
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#244466] bg-[#10233d] p-3 sm:flex-row sm:p-4">
                <div className="relative grid h-36 w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a2a47] to-[#0a1628] sm:h-32 sm:w-28">
                  {productDraft.image ? <img src={productDraft.image} alt="ตัวอย่างรูปสินค้า" className="absolute inset-0 h-full w-full object-cover" /> : <span className="max-w-[85%] break-all text-center text-2xl font-extrabold tracking-wide text-[#dce8ff] drop-shadow">{productDraft.glyph || "ITEM"}</span>}
                  <span className="absolute left-2 top-2 rounded-full border border-white/10 bg-[#0a1220]/75 px-2.5 py-1 text-[10px] font-semibold text-white">{editingProduct.type === "ticket" ? "บัตร" : "ของที่ระลึก"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white">{editingProduct.name}</h3>
                  <p className="mt-1 break-words text-sm text-[#9db0c7]">{productDraft.desc || "คำอธิบายสินค้าจะแสดงตรงนี้"}</p>
                  {productDraft.perks.trim() && <ul className="mt-2 space-y-1 text-xs text-[#d6e0ed]">{productDraft.perks.split("\n").map((perk) => perk.trim()).filter(Boolean).map((perk, index) => <li key={`${index}-${perk}`} className="flex gap-2"><span className="shrink-0 text-emerald-400">✓</span><span className="break-words">{perk}</span></li>)}</ul>}
                  {editingProduct.type === "ticket" && Number(productDraft.tokens) > 0 && <p className="mt-2 inline-flex rounded-full bg-[#19395e] px-3 py-1 text-xs font-semibold text-[#8fc8ff]">+{Number(productDraft.tokens).toLocaleString("th-TH")} Token โบนัส</p>}
                  {productDraft.options.trim() && <p className="mt-2 break-words text-xs text-[#8fa6c2]">{productDraft.optionLabel || "ตัวเลือก"}: {productDraft.options}</p>}
                  <p className="mt-2 text-xl font-bold text-[#49a5fb]">฿{(savedPrices[editingProduct.id] ?? editingProduct.price).toLocaleString("th-TH")}</p>
                </div>
              </div>
            </section>
            <div className="flex justify-end gap-2 border-t border-[#244466] pt-4">
              <button type="button" onClick={() => setEditingProduct(null)} className="rounded-lg border border-[#355779] px-4 py-2 text-sm text-[#d6e0ed] hover:bg-[#1e3654]">ยกเลิก</button>
              <button type="submit" className="rounded-lg bg-[#49a5fb] px-4 py-2 text-sm font-semibold text-[#071426] hover:bg-[#368fdf]">บันทึกรายละเอียด</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

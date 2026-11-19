"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import Header from "@/components/layout/Header";

// ====== ตั้งค่าบัญชีรับเงิน PromptPay ======
// ใส่เบอร์โทร (เช่น 0812345678) หรือเลขบัตรประชาชน/เลขนิติบุคคล 13 หลัก
const PROMPTPAY_ID = "0812345678";
const RECEIVER_NAME = "ชื่อบัญชีผู้รับเงิน";

type Status = "paid" | "pending" | "review";

type Order = {
  id: string;
  event: string;
  tier: string;
  date: string;
  qty: number;
  total: number;
  bonusToken: number;
  status: Status;
  orderedAt: string;
};

// ข้อมูลตัวอย่าง — เปลี่ยนเป็นข้อมูลจริงจาก API / DB ได้เลย
// (ตั้งเป็น [] ถ้าอยากดูหน้าแบบยังไม่มีออเดอร์)
const initialOrders: Order[] = [
  {
    id: "ORD-20261120-0003",
    event: "งานเลี้ยงรุ่น SPU",
    tier: "PLUS",
    date: "20 ธ.ค. 2569 · มหาวิทยาลัยศรีปทุม",
    qty: 1,
    total: 1500,
    bonusToken: 300,
    status: "paid",
    orderedAt: "18 พ.ย. 2569 · 14:32",
  },
  {
    id: "ORD-20261119-0002",
    event: "งานเลี้ยงรุ่น SPU",
    tier: "STANDARD",
    date: "20 ธ.ค. 2569 · มหาวิทยาลัยศรีปทุม",
    qty: 2,
    total: 1600,
    bonusToken: 0,
    status: "pending",
    orderedAt: "19 พ.ย. 2569 · 21:05",
  },
];

const statusLabel: Record<Status, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระเงิน",
  review: "รอตรวจสอบสลิป",
};

const MAX_SLIP_MB = 5;

const tabs: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอชำระ" },
  { key: "review", label: "รอตรวจสอบ" },
  { key: "paid", label: "สำเร็จ" },
];

const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;

// ====== สร้างข้อมูล QR PromptPay (มาตรฐาน EMVCo / Thai QR Payment) ======
function tlv(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16(str: string) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function promptPayPayload(target: string, amount: number) {
  const digits = target.replace(/\D/g, "");
  const isNationalId = digits.length >= 13;
  const account = isNationalId ? digits : "0066" + digits.replace(/^0/, "");

  const merchant =
    tlv("00", "A000000677010111") + tlv(isNationalId ? "02" : "01", account);

  const body =
    tlv("00", "01") +
    tlv("01", "12") + // 12 = QR ใช้ครั้งเดียว (มียอดเงินระบุ)
    tlv("29", merchant) +
    tlv("53", "764") + // THB
    tlv("54", amount.toFixed(2)) +
    tlv("58", "TH");

  const withCrcTag = body + "6304";
  return withCrcTag + crc16(withCrcTag);
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<"all" | Status>("all");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipError, setSlipError] = useState("");

  // คืนหน่วยความจำของรูปตัวอย่างเมื่อเปลี่ยนรูปหรือปิดหน้าต่าง
  useEffect(() => {
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
  }, [slipPreview]);

  const list = tab === "all" ? orders : orders.filter((o) => o.status === tab);
  const paying = orders.find((o) => o.id === payingId) ?? null;

  const closePay = () => {
    setPayingId(null);
    setSlipFile(null);
    setSlipPreview(null);
    setSlipError("");
  };

  const onPickSlip = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSlipError("ไฟล์ต้องเป็นรูปภาพ (JPG หรือ PNG)");
      return;
    }
    if (file.size > MAX_SLIP_MB * 1024 * 1024) {
      setSlipError(`ไฟล์ใหญ่เกิน ${MAX_SLIP_MB} MB`);
      return;
    }
    setSlipError("");
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const removeSlip = () => {
    setSlipFile(null);
    setSlipPreview(null);
  };

  // โหมดตัวอย่าง: สถานะเปลี่ยนในหน้านี้เท่านั้น
  // ของจริงต้องส่งสลิปไปเซิร์ฟเวอร์ (FormData -> POST /api/orders/:id/slip)
  // แล้วให้เจ้าหน้าที่หรือระบบตรวจสอบ ก่อนเปลี่ยนสถานะเป็น paid
  const submitSlip = () => {
    if (!paying) return;
    if (!slipFile) {
      setSlipError("แนบสลิปก่อนยืนยัน");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === paying.id ? { ...o, status: "review" } : o))
    );
    closePay();
    setTab("review");
  };

  return (
    <>
      <Header />
      <main className="page">
        <div className="wrap">
          <h1 className="title">คำสั่งซื้อของฉัน</h1>
          <p className="sub">ดูประวัติการสั่งซื้อและสถานะบัตรของคุณ</p>

          <div className="tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="card empty">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
                  <path d="M13 7v10" strokeDasharray="2 2.5" />
                </svg>
              </div>
              <div className="empty-title">
                {orders.length === 0 ? "ยังไม่มีคำสั่งซื้อ" : "ไม่มีคำสั่งซื้อในหมวดนี้"}
              </div>
              <div className="empty-text">
                {orders.length === 0
                  ? "เมื่อคุณซื้อบัตร คำสั่งซื้อจะแสดงที่นี่"
                  : "ลองเลือกหมวดอื่นเพื่อดูคำสั่งซื้อของคุณ"}
              </div>
            </div>
          ) : (
            list.map((o) => (
              <section key={o.id} className="card order">
                <div className="row top">
                  <div>
                    <div className="event">{o.event}</div>
                    <div className="muted">{o.date}</div>
                  </div>
                  <span className="badge">{o.tier}</span>
                </div>

                <div className="divider" />

                <div className="meta">
                  <div>
                    <div className="k">เลขที่คำสั่งซื้อ</div>
                    <div className="v">{o.id}</div>
                  </div>
                  <div>
                    <div className="k">วันที่สั่งซื้อ</div>
                    <div className="v">{o.orderedAt}</div>
                  </div>
                  <div>
                    <div className="k">จำนวน</div>
                    <div className="v">{o.qty} ใบ</div>
                  </div>
                </div>

                <div className="row bottom">
                  <div>
                    <div className="k">ยอดรวม</div>
                    <div className="total">{baht(o.total)}</div>
                    {o.bonusToken > 0 && (
                      <div className="bonus">+{o.bonusToken} Token โบนัส</div>
                    )}
                  </div>
                  <span className={`status ${o.status}`}>
                    {statusLabel[o.status]}
                  </span>
                </div>

                {o.status === "pending" && (
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => setPayingId(o.id)}
                  >
                    สแกนชำระเงิน
                  </button>
                )}
                {o.status === "review" && (
                  <p className="review-note">
                    ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ เมื่อยืนยันแล้วบัตรจะพร้อมใช้งาน
                  </p>
                )}
              </section>
            ))
          )}
        </div>
      </main>

      {/* หน้าต่างสแกนชำระเงิน */}
      {paying && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label="สแกนชำระเงิน"
          onClick={closePay}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">สแกนเพื่อชำระเงิน</div>
            <div className="muted center">PromptPay · {paying.id}</div>

            <div className="pay-amount">{baht(paying.total)}</div>

            <div className="qr-box">
              <QRCodeSVG
                value={promptPayPayload(PROMPTPAY_ID, paying.total)}
                size={200}
                level="M"
                fgColor="#0b1426"
                bgColor="#ffffff"
              />
            </div>

            <div className="receiver">{RECEIVER_NAME}</div>
            <p className="steps">
              เปิดแอปธนาคาร เลือกสแกน QR แล้วตรวจสอบยอดเงินก่อนยืนยันการโอน
            </p>

            <div className="slip">
              <div className="slip-title">แนบสลิปการโอนเงิน</div>

              {slipPreview ? (
                <div className="slip-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slipPreview} alt="สลิปการโอนเงินที่แนบ" />
                  <div className="slip-name">{slipFile?.name}</div>
                  <button className="link-btn" type="button" onClick={removeSlip}>
                    เปลี่ยนรูป
                  </button>
                </div>
              ) : (
                <label className="slip-drop">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickSlip}
                    className="slip-input"
                  />
                  <span className="slip-plus">+</span>
                  <span>เลือกรูปสลิป (JPG, PNG ไม่เกิน {MAX_SLIP_MB} MB)</span>
                </label>
              )}

              {slipError && <div className="slip-error">{slipError}</div>}
            </div>

            <button className="primary-btn" type="button" onClick={submitSlip}>
              ส่งสลิปยืนยันการชำระเงิน
            </button>
            <button className="ghost-btn" type="button" onClick={closePay}>
              ปิด
            </button>
            <p className="note">
              โหมดตัวอย่าง: ยังไม่ได้อัปโหลดสลิปไปเซิร์ฟเวอร์จริง
            </p>
          </div>
        </div>
      )}

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap");

        .page {
          min-height: 100vh;
          background: #0b1729;
          color: #fff;
          font-family: "Noto Sans Thai", system-ui, sans-serif;
          display: flex; justify-content: center;
          padding: 24px 16px 48px;
        }
        .wrap { width: 100%; max-width: 480px; }
        .title { font-size: 28px; font-weight: 700; margin: 0 0 6px; }
        .sub { font-size: 14px; color: #8d9bb5; margin: 0 0 20px; }

        .tabs {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 4px; margin-bottom: 18px;
        }
        .tab {
          flex-shrink: 0; cursor: pointer;
          background: #101a2e; color: #9aa7bf;
          border: 1px solid #1d2a44; border-radius: 999px;
          font: inherit; font-size: 14px; font-weight: 600;
          padding: 8px 18px;
        }
        .tab.active { background: #1e3a66; color: #4da3ff; border-color: #25447a; }

        .card {
          background: #101a2e;
          border: 1px solid #1d2a44;
          border-radius: 22px;
          padding: 22px;
          margin-bottom: 16px;
        }
        .empty { text-align: center; padding: 44px 22px; }
        .empty-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: #1e3a66; color: #4da3ff;
          display: grid; place-items: center; margin: 0 auto 16px;
        }
        .empty-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .empty-text { font-size: 14px; color: #8d9bb5; }

        .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .event { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .muted { font-size: 14px; color: #8d9bb5; }
        .center { text-align: center; }
        .badge {
          background: #1e3a66; color: #4da3ff;
          font-size: 13px; font-weight: 700;
          padding: 6px 16px; border-radius: 999px; flex-shrink: 0;
        }
        .divider { height: 1px; background: #1d2a44; margin: 18px 0; }

        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; margin-bottom: 18px; }
        .meta > div:first-child { grid-column: 1 / -1; }
        .k { font-size: 13px; color: #8d9bb5; margin-bottom: 3px; }
        .v { font-size: 15px; font-weight: 600; }

        .bottom { align-items: flex-end; }
        .total { font-size: 30px; font-weight: 700; color: #4da3ff; line-height: 1.1; }
        .bonus { font-size: 13px; color: #8d9bb5; margin-top: 4px; }

        .status {
          font-size: 13px; font-weight: 700;
          padding: 6px 14px; border-radius: 999px;
        }
        .status.paid { background: rgba(52, 199, 123, 0.15); color: #34c77b; }
        .status.pending { background: rgba(255, 184, 77, 0.15); color: #ffb84d; }
        .status.review { background: rgba(77, 163, 255, 0.15); color: #4da3ff; }
        .review-note { font-size: 13px; color: #8d9bb5; line-height: 1.6; margin: 16px 0 0; }

        .slip { margin-top: 18px; text-align: left; }
        .slip-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .slip-drop {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          border: 1.5px dashed #25447a; border-radius: 16px;
          padding: 18px 12px; cursor: pointer; text-align: center;
          font-size: 13px; color: #9aa7bf;
        }
        .slip-drop:hover { background: #14264a; }
        .slip-input { position: absolute; width: 1px; height: 1px; opacity: 0; }
        .slip-plus {
          width: 36px; height: 36px; border-radius: 50%;
          background: #1e3a66; color: #4da3ff;
          display: grid; place-items: center; font-size: 22px; line-height: 1;
        }
        .slip-preview { text-align: center; }
        .slip-preview img {
          max-width: 100%; max-height: 220px; border-radius: 12px;
          border: 1px solid #1d2a44; object-fit: contain; background: #0b1729;
        }
        .slip-name { font-size: 12px; color: #8d9bb5; margin: 8px 0 2px; word-break: break-all; }
        .link-btn {
          background: none; border: 0; cursor: pointer;
          color: #4da3ff; font: inherit; font-size: 13px; padding: 0;
        }
        .slip-error { font-size: 13px; color: #ff6b6b; margin-top: 8px; }

        .primary-btn {
          display: block; width: 100%; box-sizing: border-box;
          margin-top: 20px; border: 0; cursor: pointer; text-align: center;
          background: #4da3ff; color: #0b1729;
          font: inherit; font-size: 17px; font-weight: 700;
          padding: 15px; border-radius: 999px;
          transition: filter 0.15s, transform 0.05s;
        }
        .primary-btn:hover { filter: brightness(1.08); }
        .primary-btn:active { transform: scale(0.99); }

        .ghost-btn {
          display: block; width: 100%; box-sizing: border-box;
          margin-top: 10px; cursor: pointer; text-align: center;
          background: transparent; color: #9aa7bf;
          border: 1px solid #25447a;
          font: inherit; font-size: 16px; font-weight: 600;
          padding: 13px; border-radius: 999px;
        }
        .ghost-btn:hover { background: #14264a; }

        .overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(4, 9, 18, 0.75);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; overflow-y: auto;
          font-family: "Noto Sans Thai", system-ui, sans-serif;
        }
        .modal {
          width: 100%; max-width: 380px;
          background: #101a2e; color: #fff;
          border: 1px solid #1d2a44; border-radius: 24px;
          padding: 26px 22px 22px; text-align: center;
        }
        .modal-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .pay-amount { font-size: 38px; font-weight: 700; color: #4da3ff; margin: 14px 0 16px; line-height: 1.1; }
        .qr-box {
          display: inline-block; background: #fff;
          border-radius: 14px; padding: 14px; line-height: 0;
        }
        .receiver { font-size: 16px; font-weight: 700; margin-top: 14px; }
        .steps { font-size: 13px; color: #9aa7bf; line-height: 1.6; margin: 6px 0 0; }
        .note { font-size: 12px; color: #8d9bb5; margin: 14px 0 0; }
      `}</style>
    </>
  );
}
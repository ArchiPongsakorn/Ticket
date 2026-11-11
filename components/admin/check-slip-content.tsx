"use client";

import { useState } from "react";

const css = `
/* CheckSlip — CSS ธรรมดา ไม่ต้องใช้ Tailwind */
.cs-page {
  --cs-bg: #0a1628;
  --cs-card: #0f2038;
  --cs-card-hover: #132b48;
  --cs-active: #19395e;
  --cs-border: #1c3350;
  --cs-accent: #49a5fb;
  --cs-text: #f1f5f9;
  --cs-muted: #94a3b8;
  --cs-green: #34d399;
  --cs-red: #f87171;
  --cs-amber: #fcd34d;

  min-height: 100vh;
  padding: 32px;
  background: var(--cs-bg);
  color: var(--cs-text);
  box-sizing: border-box;
}
.cs-page *,
.cs-page *::before,
.cs-page *::after {
  box-sizing: border-box;
}

.cs-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}
.cs-subtitle {
  margin: 4px 0 24px;
  font-size: 14px;
  color: var(--cs-muted);
}

.cs-grid {
  display: grid;
  grid-template-columns: minmax(280px, 380px) 1fr;
  gap: 20px;
}
@media (max-width: 1024px) {
  .cs-grid {
    grid-template-columns: 1fr;
  }
}

/* รายการคำสั่งซื้อ */
.cs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.cs-item {
  width: 100%;
  padding: 16px;
  text-align: left;
  color: inherit;
  font: inherit;
  background: var(--cs-card);
  border: 1px solid var(--cs-border);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.cs-item:hover {
  background: var(--cs-card-hover);
}
.cs-item.is-active {
  background: var(--cs-active);
  border-color: var(--cs-accent);
}
.cs-item:focus-visible {
  outline: 2px solid var(--cs-accent);
  outline-offset: 2px;
}
.cs-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--cs-muted);
}
.cs-item-name {
  margin-top: 8px;
  font-weight: 600;
}
.cs-item-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--cs-muted);
}

/* ป้ายสถานะ */
.cs-badge {
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
}
.cs-badge.pending {
  background: rgba(251, 191, 36, 0.15);
  color: var(--cs-amber);
}
.cs-badge.approved {
  background: rgba(52, 211, 153, 0.15);
  color: var(--cs-green);
}
.cs-badge.rejected {
  background: rgba(248, 113, 113, 0.15);
  color: var(--cs-red);
}

/* รายละเอียด */
.cs-detail {
  padding: 24px;
  background: var(--cs-card);
  border: 1px solid var(--cs-border);
  border-radius: 16px;
}
.cs-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.cs-id {
  font-size: 12px;
  color: var(--cs-muted);
}
.cs-name {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 700;
}
.cs-total-wrap {
  text-align: right;
}
.cs-total-label {
  font-size: 12px;
  color: var(--cs-muted);
}
.cs-total {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--cs-accent);
}

.cs-body {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  margin-top: 24px;
}
@media (max-width: 720px) {
  .cs-body {
    grid-template-columns: 1fr;
  }
}

.cs-slip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  overflow: hidden;
  background: var(--cs-bg);
  border: 2px dashed rgba(73, 165, 251, 0.5);
  border-radius: 12px;
}
.cs-slip img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cs-slip-empty {
  padding: 0 16px;
  text-align: center;
  font-size: 12px;
  color: var(--cs-muted);
}
.cs-slip-icon {
  margin-bottom: 8px;
  font-size: 32px;
}

.cs-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cs-info {
  margin: 0;
  padding: 0 16px;
  font-size: 14px;
  background: var(--cs-bg);
  border-radius: 12px;
}
.cs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}
.cs-row + .cs-row {
  border-top: 1px solid var(--cs-border);
}
.cs-row dt {
  color: var(--cs-muted);
}
.cs-row dd {
  margin: 0;
  font-weight: 500;
}
.cs-row.warn dd {
  color: var(--cs-red);
  font-weight: 600;
}

.cs-warn-box {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--cs-red);
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

.cs-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--cs-muted);
}
.cs-input {
  width: 100%;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
  color: var(--cs-text);
  background: var(--cs-bg);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
}
.cs-input::placeholder {
  color: #64748b;
}
.cs-input:focus {
  outline: none;
  border-color: var(--cs-accent);
}
.cs-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--cs-red);
}

.cs-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.cs-btn {
  padding: 10px 0;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.cs-btn:focus-visible {
  outline: 2px solid var(--cs-accent);
  outline-offset: 2px;
}
.cs-btn.approve {
  color: #06231a;
  background: var(--cs-green);
  border: 1px solid var(--cs-green);
}
.cs-btn.approve:hover {
  background: #6ee7b7;
}
.cs-btn.reject {
  color: var(--cs-red);
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.6);
}
.cs-btn.reject:hover {
  background: rgba(248, 113, 113, 0.1);
}

.cs-note {
  margin: 0;
  font-size: 12px;
  color: var(--cs-muted);
}

.cs-result {
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
}
.cs-result.approved {
  background: rgba(52, 211, 153, 0.15);
  color: var(--cs-green);
}
.cs-result.rejected {
  background: rgba(248, 113, 113, 0.15);
  color: var(--cs-red);
}
`;

type Status = "pending" | "approved" | "rejected";

type Order = {
  id: string;
  name: string;
  items: string;
  total: number;
  slipAmount: number;
  transferAt: string;
  email: string;
  slipUrl?: string; // ใส่ URL รูปสลิปจริงตรงนี้
  status: Status;
  reason?: string;
};

// ข้อมูลตัวอย่าง — เปลี่ยนไปดึงจาก API/Database ของคุณภายหลัง
const initialOrders: Order[] = [
  {
    id: "0041",
    name: "สมชาย ใจดี",
    items: "บัตร × 2",
    total: 1200,
    slipAmount: 1200,
    transferAt: "12 พ.ย. 2569 02:15",
    email: "somchai@gmail.com",
    status: "pending",
  },
  {
    id: "0042",
    name: "สุดา แสงทอง",
    items: "บัตร × 1 · เสื้อ × 1",
    total: 950,
    slipAmount: 950,
    transferAt: "12 พ.ย. 2569 01:48",
    email: "suda@gmail.com",
    status: "pending",
  },
  {
    id: "0043",
    name: "ประเสริฐ มีสุข",
    items: "เสื้อ × 2",
    total: 700,
    slipAmount: 650,
    transferAt: "11 พ.ย. 2569 23:30",
    email: "prasert@gmail.com",
    status: "pending",
  },
  {
    id: "0044",
    name: "วารี พูนทรัพย์",
    items: "บัตร × 3",
    total: 1800,
    slipAmount: 1800,
    transferAt: "11 พ.ย. 2569 22:05",
    email: "waree@gmail.com",
    status: "pending",
  },
];

const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;

const statusLabel: Record<Status, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธแล้ว",
};

export default function CheckSlipContent() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedId, setSelectedId] = useState<string>(initialOrders[0].id);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const selected = orders.find((o) => o.id === selectedId)!;
  const isPending = selected.status === "pending";
  const amountMismatch = selected.slipAmount !== selected.total;

  function select(id: string) {
    setSelectedId(id);
    setReason("");
    setError("");
  }

  function update(status: Status, reasonText?: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedId ? { ...o, status, reason: reasonText } : o
      )
    );
    setReason("");
    setError("");
  }

  function handleApprove() {
    // TODO: เรียก API เพื่อสร้าง QR Code และส่งอีเมลผู้ซื้อ
    // await fetch("/api/checkslip/approve", { method: "POST", body: JSON.stringify({ id: selected.id }) });
    update("approved");
  }

  function handleReject() {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลที่ปฏิเสธ");
      return;
    }
    // TODO: เรียก API เพื่อแจ้งผู้ซื้อ
    update("rejected", reason.trim());
  }

  return (
    <div className="cs-page">
      <style>{css}</style>
      <header>
        <h1 className="cs-title">ตรวจสลิปการโอนเงิน</h1>
        <p className="cs-subtitle">
          เลือกคำสั่งซื้อ ตรวจสลิป แล้ว Approve หรือ Reject
        </p>
      </header>

      <div className="cs-grid">
        {/* รายการคำสั่งซื้อ */}
        <ul className="cs-list">
          {orders.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => select(o.id)}
                className={`cs-item${o.id === selectedId ? " is-active" : ""}`}
              >
                <div className="cs-item-top">
                  <span>#{o.id}</span>
                  <span className={`cs-badge ${o.status}`}>
                    {statusLabel[o.status]}
                  </span>
                </div>
                <div className="cs-item-name">{o.name}</div>
                <div className="cs-item-meta">{o.items}</div>
              </button>
            </li>
          ))}
        </ul>

        {/* รายละเอียด */}
        <section className="cs-detail">
          <div className="cs-detail-head">
            <div>
              <div className="cs-id">#{selected.id}</div>
              <h2 className="cs-name">{selected.name}</h2>
              <div className="cs-item-meta">{selected.items}</div>
            </div>
            <div className="cs-total-wrap">
              <div className="cs-total-label">ยอดที่ต้องชำระ</div>
              <div className="cs-total">{baht(selected.total)}</div>
            </div>
          </div>

          <div className="cs-body">
            {/* รูปสลิป */}
            <div className="cs-slip">
              {selected.slipUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.slipUrl} alt={`สลิปของ ${selected.name}`} />
              ) : (
                <div className="cs-slip-empty">
                  <div className="cs-slip-icon">🧾</div>
                  [ภาพสลิปผู้ซื้อแนบ]
                </div>
              )}
            </div>

            <div className="cs-right">
              <dl className="cs-info">
                <div className="cs-row">
                  <dt>วันเวลาที่โอน</dt>
                  <dd>{selected.transferAt}</dd>
                </div>
                <div className={`cs-row${amountMismatch ? " warn" : ""}`}>
                  <dt>ยอดในสลิป</dt>
                  <dd>{baht(selected.slipAmount)}</dd>
                </div>
                <div className="cs-row">
                  <dt>อีเมลผู้ซื้อ</dt>
                  <dd>{selected.email}</dd>
                </div>
              </dl>

              {amountMismatch && (
                <p className="cs-warn-box">
                  ยอดในสลิปไม่ตรงกับยอดที่ต้องชำระ (ต่างกัน{" "}
                  {baht(Math.abs(selected.total - selected.slipAmount))})
                </p>
              )}

              {isPending ? (
                <>
                  <div>
                    <label htmlFor="cs-reason" className="cs-label">
                      เหตุผล (กรณี Reject)
                    </label>
                    <input
                      id="cs-reason"
                      className="cs-input"
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setError("");
                      }}
                      placeholder="เช่น ยอดไม่ตรง สลิปไม่ชัด"
                    />
                    {error && <p className="cs-error">{error}</p>}
                  </div>

                  <div className="cs-actions">
                    <button
                      type="button"
                      className="cs-btn approve"
                      onClick={handleApprove}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="cs-btn reject"
                      onClick={handleReject}
                    >
                      Reject
                    </button>
                  </div>

                  <p className="cs-note">
                    เมื่อ Approve ระบบจะสร้าง QR Code และส่งทาง Gmail ไปยังอีเมลของผู้ซื้อ
                  </p>
                </>
              ) : (
                <div className={`cs-result ${selected.status}`}>
                  {selected.status === "approved"
                    ? "อนุมัติแล้ว — ส่ง QR Code ให้ผู้ซื้อเรียบร้อย"
                    : `ปฏิเสธแล้ว — เหตุผล: ${selected.reason}`}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
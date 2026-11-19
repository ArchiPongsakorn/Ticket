"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Header from "@/components/layout/Header";

// ข้อมูลตัวอย่าง — เปลี่ยนเป็นข้อมูลจริงจาก API / DB ได้เลย
const user = {
  name: "user",
  role: "สมาชิกทั่วไป · ตัวอย่างข้อมูลบัญชี",
  tokens: 300,
};

const ticket = {
  event: "งานเลี้ยงรุ่น SPU",
  tier: "PLUS",
  date: "20 ธ.ค. 2569 · มหาวิทยาลัยศรีปทุม",
  code: "MF662757 · 0001",
  qrValue: "MF662757-0001",
  gate: "แสดง QR Code นี้แก่เจ้าหน้าที่ ณ จุดเข้างาน",
  location: "อาคาร 11 ชั้น 3",
};

export default function ProfilePage() {
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const saveTicket = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `ticket-${ticket.qrValue}.png`;
    a.click();
  };

  return (
    <>
      <Header />
      <main className="page">
      <div className="wrap">
        <h1 className="title">โปรไฟล์ของฉัน</h1>

        <div className="user-row">
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="link-btn" type="button">
            แก้ไขข้อมูล
          </button>
        </div>

        {/* Token card */}
        <section className="card token-card">
          <div>
            <div className="card-label">ยอด Token คงเหลือ</div>
            <div className="token-amount">
              <span className="token-num">{user.tokens}</span>
              <span className="token-unit">Token</span>
            </div>
            <div className="muted">โบนัสจากการซื้อบัตร</div>
          </div>
          <div className="token-icon">T</div>
        </section>

        {/* Ticket */}
        <h2 className="section-title">QR Code สำหรับเข้างาน</h2>
        <section className="card ticket-card">
          <div className="ticket-head">
            <div>
              <div className="event-name">{ticket.event}</div>
              <div className="muted">{ticket.date}</div>
            </div>
            <span className="badge">{ticket.tier}</span>
          </div>

          <div className="qr-box" ref={qrWrapRef}>
            <QRCodeCanvas
              value={ticket.qrValue}
              size={168}
              level="M"
              fgColor="#0b1426"
              bgColor="#ffffff"
            />
          </div>

          <div className="ticket-code">{ticket.code}</div>
          <p className="gate">
            {ticket.gate}
            <br />
            {ticket.location}
          </p>

          <button className="primary-btn" type="button" onClick={saveTicket}>
            บันทึกบัตรเข้างาน
          </button>
          <p className="note">QR ตัวอย่างสำหรับงานออกแบบ ไม่ใช่บัตรจริง</p>
        </section>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap");

        .page {
          min-height: 100vh;
          background: #0b1729;
          color: #ffffff;
          font-family: "Noto Sans Thai", system-ui, sans-serif;
          display: flex;
          justify-content: center;
          padding: 24px 16px 48px;
        }
        .wrap { width: 100%; max-width: 480px; }

        .title { font-size: 28px; font-weight: 700; margin: 0 0 20px; }

        .user-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 18px;
        }
        .user-name { font-size: 20px; font-weight: 700; }
        .user-role { font-size: 13px; color: #8d9bb5; margin-top: 4px; }
        .link-btn {
          background: none; border: 0; cursor: pointer;
          color: #4da3ff; font: inherit; font-size: 15px; padding: 0;
        }

        .card {
          border-radius: 22px;
          border: 1px solid #1d2a44;
          padding: 22px;
        }

        .token-card {
          background: linear-gradient(135deg, #14264a 0%, #162b57 100%);
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 28px;
        }
        .card-label { font-size: 16px; font-weight: 600; }
        .token-amount { display: flex; align-items: baseline; gap: 22px; margin: 14px 0 12px; }
        .token-num { font-size: 52px; font-weight: 700; color: #4da3ff; line-height: 1; }
        .token-unit { font-size: 17px; font-weight: 600; }
        .muted { font-size: 14px; color: #8d9bb5; }
        .token-icon {
          width: 70px; height: 70px; border-radius: 50%;
          background: #25447a; color: #4da3ff;
          display: grid; place-items: center;
          font-size: 30px; font-weight: 700; flex-shrink: 0;
        }

        .section-title { font-size: 22px; font-weight: 700; margin: 0 0 14px; }

        .ticket-card { background: #101a2e; text-align: center; }
        .ticket-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          text-align: left; margin-bottom: 22px;
        }
        .event-name { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
        .badge {
          background: #1e3a66; color: #4da3ff;
          font-size: 13px; font-weight: 700;
          padding: 6px 16px; border-radius: 999px;
        }

        .qr-box {
          display: inline-block;
          background: #ffffff; border-radius: 14px;
          padding: 16px; line-height: 0;
        }
        .ticket-code { font-size: 18px; font-weight: 700; margin-top: 18px; letter-spacing: 0.5px; }
        .gate { font-size: 14px; color: #9aa7bf; line-height: 1.6; margin: 8px 0 22px; }

        .primary-btn {
          width: 100%; border: 0; cursor: pointer;
          background: #4da3ff; color: #0a1120;
          font: inherit; font-size: 17px; font-weight: 700;
          padding: 15px; border-radius: 999px;
          transition: filter 0.15s, transform 0.05s;
        }
        .primary-btn:hover { filter: brightness(1.08); }
        .primary-btn:active { transform: scale(0.99); }

        .note { font-size: 12px; color: #8d9bb5; margin: 14px 0 0; }
      `}</style>
      </main>
    </>
  );
}
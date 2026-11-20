"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Header from "@/components/layout/Header";
import { usePersistentState } from "@/hooks/usePersistentState";
import { getCurrentUser, type AuthUser } from "@/lib/local-auth";
import type { Attendee } from "@/components/admin/event-tokens/types";
import { CUSTOMER_ORDERS_STORAGE_KEY, type CustomerOrder } from "@/lib/api";
import { readJSON } from "@/lib/storage";
import { issueApprovedOrderTickets } from "@/lib/ticket-issuance";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [attendees, setAttendees] = usePersistentState<Attendee[]>("admin-event-attendees", []);
  const [orders, setOrders] = usePersistentState<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []);

  useEffect(() => {
    const refreshUser = () => setCurrentUser(getCurrentUser());
    refreshUser();
    window.addEventListener("ticket:auth-changed", refreshUser);
    return () => window.removeEventListener("ticket:auth-changed", refreshUser);
  }, []);

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === "admin-event-attendees") {
        setAttendees(readJSON<Attendee[]>("admin-event-attendees", []));
      }
      if (event.key === CUSTOMER_ORDERS_STORAGE_KEY) {
        setOrders(readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []));
      }
    };
    const refreshAll = () => {
      setAttendees(readJSON<Attendee[]>("admin-event-attendees", []));
      setOrders(readJSON<CustomerOrder[]>(CUSTOMER_ORDERS_STORAGE_KEY, []));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("ticket:event-attendees-updated", refreshAll);
    window.addEventListener("ticket:orders-updated", refreshAll);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ticket:event-attendees-updated", refreshAll);
      window.removeEventListener("ticket:orders-updated", refreshAll);
    };
  }, [setAttendees, setOrders]);

  useEffect(() => {
    const repairedAttendees = orders
      .filter((order) => order.status === "paid")
      .reduce((current, order) => issueApprovedOrderTickets(order, current), attendees);
    if (JSON.stringify(repairedAttendees) !== JSON.stringify(attendees)) {
      setAttendees(repairedAttendees);
    }
  }, [attendees, orders, setAttendees]);

  const myTickets = currentUser
    ? attendees.filter((ticket) =>
        ticket.active === true &&
        (ticket.ownerEmail === currentUser.email || ticket.email === currentUser.email) &&
        orders.some((order) => order.id === ticket.orderId && order.status === "paid"),
      )
    : [];
  const myOrders = currentUser
    ? orders.filter((order) => order.ownerEmail === currentUser.email)
    : [];
  const latestOrder = myOrders[0];
  const profileName = latestOrder?.buyerName || currentUser?.username;
  const tokenBalance = myTickets.reduce((sum, ticket) => sum + ticket.tokens, 0);
  const saveTicket = (code: string) => {
    const canvas = document.querySelector<HTMLCanvasElement>(`[data-ticket-code="${code}"] canvas`);
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `ticket-${code}.png`;
    link.click();
  };

  return (
    <>
      <Header />
      <main className="page">
        <div className="wrap">
          <h1 className="title">โปรไฟล์ของฉัน</h1>
          <div className="user-row">
            <div>
              <div className="user-name">{profileName ?? "เข้าสู่ระบบเพื่อดูข้อมูล"}</div>
              <div className="user-role">{currentUser?.email ?? ""}</div>
              {latestOrder?.hasMerch && latestOrder.shippingAddress && (
                <div className="user-role">ที่อยู่จัดส่ง: {latestOrder.shippingAddress}</div>
              )}
            </div>
          </div>

          <section className="card token-card">
            <div>
              <div className="card-label">ยอด Token คงเหลือ</div>
              <div className="token-amount">
                <span className="token-num">{tokenBalance}</span>
                <span className="token-unit">Token</span>
              </div>
              <div className="muted">ยอดจากบัตรและรายการเติม Token</div>
            </div>
            <div className="token-icon">T</div>
          </section>

          <h2 className="section-title">คำสั่งซื้อของฉัน</h2>
          {myOrders.length === 0 ? (
            <p className="muted">ยังไม่มีคำสั่งซื้อในบัญชีนี้</p>
          ) : myOrders.map((order) => (
            <section className="card ticket-card" key={order.id} style={{ marginBottom: 12 }}>
              <div className="ticket-head">
                <div>
                  <div className="event-name">{order.tier}</div>
                  <div className="muted">{order.id} · {order.orderedAt}</div>
                </div>
                <span className="badge">{order.status === "paid" ? "ชำระแล้ว" : order.status === "review" ? "รอตรวจสลิป" : order.status === "rejected" ? "ไม่อนุมัติ" : "รอชำระเงิน"}</span>
              </div>
              <div className="row bottom">
                <span>จำนวน {order.qty} รายการ</span>
                <strong>{order.total.toLocaleString("th-TH")} บาท</strong>
              </div>
            </section>
          ))}

          <h2 className="section-title">QR Code สำหรับเข้างาน</h2>
          {myTickets.length === 0 ? (
            <section className="card ticket-card muted">ยังไม่มีบัตรที่ผูกกับบัญชีนี้</section>
          ) : myTickets.map((ticket) => {
            const order = orders.find((item) => item.id === ticket.orderId);
            return (
              <section className="card ticket-card" key={ticket.id} style={{ marginBottom: 16 }}>
                <div className="ticket-head">
                  <div>
                    <div className="event-name">{ticket.type}</div>
                    <div className="muted">{order?.event ?? "งานเลี้ยงรุ่น SPU"}</div>
                  </div>
                  <span className="badge">{ticket.active === false ? "รอตรวจสอบการชำระเงิน" : ticket.checkedIn ? "เข้างานแล้ว" : "พร้อมใช้งาน"}</span>
                </div>
                <div className="qr-box" data-ticket-code={ticket.id}>
                  <QRCodeCanvas value={ticket.id} size={168} level="M" fgColor="#0b1426" bgColor="#ffffff" />
                </div>
                <div className="ticket-code">{ticket.id}</div>
                <p className="gate">แสดง QR Code นี้แก่เจ้าหน้าที่ ณ จุดเข้างาน<br />อาคาร 11 ชั้น 3</p>
                <button className="primary-btn" type="button" onClick={() => saveTicket(ticket.id)}>บันทึกบัตรเข้างาน</button>
              </section>
            );
          })}
        </div>      <style>{`
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

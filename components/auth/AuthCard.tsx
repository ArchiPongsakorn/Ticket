"use client";
import type { KeyboardEvent } from "react";
import type { AuthMode, AuthDone } from "../../types/domain";
import { useState } from "react";
import AuthForm from "./AuthForm";
import AuthSuccess from "./AuthSuccess";
import s from "./auth.module.css";

const TABS: Array<{id: AuthMode; label: string}> = [
  { id: "login", label: "เข้าสู่ระบบ" },
  { id: "register", label: "สมัครสมาชิก" },
];

/** การ์ดฝั่งขวา: แท็บสลับ เข้าสู่ระบบ/สมัครสมาชิก และหน้าสำเร็จ */
export default function AuthCard({ initialTab = "login" }: { initialTab?: AuthMode }) {
  const [tab, setTab] = useState(initialTab);
  const [done, setDone] = useState<AuthDone | null>(null);

  const switchTab = (id: AuthMode) => {
    setTab(id);
    window.history.replaceState(null, "", id === "register" ? "/login?tab=register" : "/login");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") switchTab(tab === "login" ? "register" : "login");
  };

  return (
    <section className={s.card} aria-label="เข้าสู่ระบบหรือสมัครสมาชิก">
      {done ? (
        <AuthSuccess {...done} />
      ) : (
        <>
          <div className={s.tabs} role="tablist" aria-label="เลือกการดำเนินการ" onKeyDown={onKeyDown}>
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" className={s.tab} aria-selected={tab === t.id} onClick={() => switchTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <AuthForm key={tab} mode={tab} onSwitch={switchTab} onSuccess={setDone} />
        </>
      )}
    </section>
  );
}

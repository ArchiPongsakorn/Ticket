"use client";

import type { KeyboardEvent } from "react";
import type { AuthMode } from "../../types/domain";
import { useState } from "react";
import AuthForm from "./AuthForm";
import s from "./auth.module.css";

const TABS: Array<{ id: AuthMode; label: string }> = [
  { id: "login", label: "เข้าสู่ระบบ" },
  { id: "register", label: "สมัครสมาชิก" },
];

/** Login and registration tabs, without any simulated success state. */
export default function AuthCard({ initialTab = "login" }: { initialTab?: AuthMode }) {
  const [tab, setTab] = useState(initialTab);

  const switchTab = (id: AuthMode) => {
    setTab(id);
    window.history.replaceState(null, "", id === "register" ? "/login?tab=register" : "/login");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      switchTab(tab === "login" ? "register" : "login");
    }
  };

  return (
    <section className={s.card} aria-label="เข้าสู่ระบบหรือสมัครสมาชิก">
      <div className={s.tabs} role="tablist" aria-label="เลือกการดำเนินการ" onKeyDown={onKeyDown}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={s.tab}
            aria-selected={tab === item.id}
            onClick={() => switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <AuthForm key={tab} mode={tab} onSwitch={switchTab} />
    </section>
  );
}

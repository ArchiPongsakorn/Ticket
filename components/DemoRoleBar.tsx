"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { demoLogout, getDemoSession, type DemoRole } from "@/lib/mock-auth";
/** Visual demo session marker; NOT security. */
export default function DemoRoleBar({ role }: { role: DemoRole }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const session = getDemoSession();
    setAllowed(session?.role === role);
    setReady(true);
    if (role === "admin" && session?.role !== "admin") router.replace("/login");
  }, [role, router]);
  if (!ready || !allowed) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        bottom: 18,
        right: 18,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#10213c",
        color: "white",
        border: "1px solid #4e789c",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 8px 28px #0006",
        fontSize: 13,
      }}
    >

      <button
        type="button"
        style={{
          padding: "6px 10px",
          background: "#e1efff",
          color: "#13233d",
          border: 0,
          borderRadius: 7,
          cursor: "pointer",
        }}
        onClick={() => {
          demoLogout();
          router.push("/login");
          router.refresh();
        }}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}

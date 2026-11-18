"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AUTH_CHANGE_EVENT, getCurrentUser } from "@/lib/local-auth";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function checkRole() {
      const user = getCurrentUser();

      if (
        user?.role === "admin" ||
        user?.role === "staff" ||
        user?.role === "merchant"
      ) {
        setAllowed(true);
      } else {
        setAllowed(false);
        router.replace(user ? "/" : "/login");
      }
    }

    checkRole();

    window.addEventListener(AUTH_CHANGE_EVENT, checkRole);
    window.addEventListener("storage", checkRole);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkRole);
      window.removeEventListener("storage", checkRole);
    };
  }, [router]);

  if (!allowed) {
    return <div className="min-h-screen bg-[#0a1220]" />;
  }

  return <>{children}</>;
}

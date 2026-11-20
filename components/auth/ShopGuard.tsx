
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  getCurrentUser,
} from "@/lib/local-auth";

export default function ShopGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);


  //CHECK ROLE USER
  useEffect(() => {
    function checkLogin() {
      const user = getCurrentUser();
      
      if (!user) {
        setAllowed(false);
        sessionStorage.setItem("ticket:returnTo", "/shop");
        router.replace("/login");
      } else if (user.role !== "user") {
        setAllowed(false);
        router.replace("/admin");
      } else {
        setAllowed(true);
      }
    }

    checkLogin();

    window.addEventListener(AUTH_CHANGE_EVENT, checkLogin);
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, [router]);

  if (!allowed) {
    return <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>;
  }

  return <>{children}</>;
}

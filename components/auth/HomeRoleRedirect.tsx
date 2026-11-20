"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH_CHANGE_EVENT, getCurrentUser } from "@/lib/local-auth";

export default function HomeRoleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectElevatedUser = () => {
      const user = getCurrentUser();
      if (user && user.role !== "user") router.replace("/admin");
    };

    redirectElevatedUser();
    window.addEventListener(AUTH_CHANGE_EVENT, redirectElevatedUser);
    window.addEventListener("storage", redirectElevatedUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, redirectElevatedUser);
      window.removeEventListener("storage", redirectElevatedUser);
    };
  }, [router]);

  return null;
}

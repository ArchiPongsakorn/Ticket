
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/mock-auth";

export default function RequireUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getDemoSession();

    if (!session || session.role !== "user") {
      router.replace("/login?next=/shop");
      return;
    }

    setAllowed(true);
  }, [router]);

  // ไม่แสดงข้อความระหว่างตรวจสอบ
  if (!allowed) {
    return null;
  }

  return (
    <div className="shopFadeIn">
      {children}

      <style jsx>{`
        .shopFadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shopFadeIn {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

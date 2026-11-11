
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { getDemoSession } from "@/lib/mock-auth";

type ShopLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href"
>;

export default function ShopLink({
  onClick,
  children,
  ...props
}: ShopLinkProps) {
  const router = useRouter();

  return (
    <Link
      {...props}
      href="/shop"
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) return;

        const session = getDemoSession();

        if (!session || session.role !== "user") {
          event.preventDefault();
          router.push("/login?next=/shop");
        }
      }}
    >
      {children}
    </Link>
  );
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { getCurrentUser } from "@/lib/local-auth";

type ShopLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export default function ShopLink({
  onClick,
  ...props
}: ShopLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const user = getCurrentUser();

    if (!user) {
      event.preventDefault();

      sessionStorage.setItem("ticket:returnTo", "/shop");
      router.push("/login");
    }
  }

  return (
    <Link
      {...props}
      href="/shop"
      onClick={handleClick}
    />
  );
}

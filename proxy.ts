
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

function equalSecret(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  return (
    left.length === right.length &&
    timingSafeEqual(left, right)
  );
}

export function proxy(request: NextRequest) {

  // ==================================
  // DEMO MODE - LocalStorage Login
  // ==================================
  // ข้าม Basic Auth เฉพาะตอน npm run dev
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // ==================================
  // PRODUCTION - Basic Authentication
  // ==================================
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASSWORD;

  const configured = Boolean(user && pass);

  if (!configured) {
    return new NextResponse(
      "Admin access is not configured",
      { status: 503 }
    );
  }

  const header =
    request.headers.get("authorization") || "";

  if (header.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(
        header.slice(6),
        "base64"
      ).toString("utf8");

      const divider = decoded.indexOf(":");

      if (
        divider >= 0 &&
        equalSecret(decoded.slice(0, divider), user!) &&
        equalSecret(decoded.slice(divider + 1), pass!)
      ) {
        return NextResponse.next();
      }
    } catch {
      // Invalid authorization
    }
  }

  return new NextResponse(
    "Authentication required",
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Admin Dashboard", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    }
  );
}

export const config = {
  matcher: ["/admin/:path*"],
};

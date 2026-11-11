/** DEMO ONLY: browser-local role switcher, not an authentication mechanism. */
export type DemoRole = "user" | "admin";
export type DemoSession = { role: DemoRole; username: string };
const KEY = "nextpro-demo-session";
const accounts = {
  user: { password: "user", role: "user" },
  admin: { password: "admin", role: "admin" },
} as const;

export function demoLogin(
  username: string,
  password: string,
): DemoSession | null {
  const key = username.trim().toLowerCase();
  const account = accounts[key as keyof typeof accounts];
  if (!account || account.password !== password) return null;
  const session: DemoSession = { role: account.role, username: key };
  if (typeof window !== "undefined")
    window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}
export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "role" in value &&
      "username" in value &&
      (value.role === "user" || value.role === "admin") &&
      typeof value.username === "string"
    ) {
      return { role: value.role, username: value.username };
    }
  } catch {
    /* ignore */
  }
  return null;
}
export function demoLogout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

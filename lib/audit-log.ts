import { getCurrentUser } from "@/lib/local-auth";

export const AUDIT_LOG_STORAGE_KEY = "admin-audit-logs";
export const AUDIT_LOG_EVENT = "admin:audit-log-updated";

export type AuditLogEntry = {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
};

export function readAuditLogs(): AuditLogEntry[] {
  try {
    const raw = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? (parsed as AuditLogEntry[]).map((entry) => ({
          ...entry,
          actor: entry.actor.replace(/\s+\((admin|staff|merchant|user)\)$/, ""),
        }))
      : [];
  } catch {
    return [];
  }
}

export function recordAudit(action: string, detail: string) {
  try {
    const user = getCurrentUser();
    const entry: AuditLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: new Date().toLocaleString("th-TH"),
      actor: user?.username ?? "ไม่ทราบผู้ใช้",
      action,
      detail,
    };
    const logs = [entry, ...readAuditLogs()].slice(0, 500);
    window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event(AUDIT_LOG_EVENT));
  } catch (error) {
    console.error("Unable to save audit log", error);
  }
}

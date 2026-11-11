/** อ่าน/เขียน localStorage แบบปลอดภัย (ใช้เฉพาะฝั่ง client) */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ใช้งานต่อได้แม้บันทึกไม่ได้ */
  }
}

import { ROLE_ACCOUNTS } from "@/data/role-accounts";

export type AuthRole = "user" | "admin" | "staff" | "merchant";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: AuthRole;
};

type Account = AuthUser & {
  password: string;
};

type Session = {
  userId: string;
};

export const AUTH_CHANGE_EVENT = "ticket:auth-changed";
export const ACCOUNT_STORAGE_KEY = "ticket:local-auth:accounts:v1";
export const SESSION_STORAGE_KEY = "ticket:local-auth:session:v1";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  let users: Account[] = [];

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      users = parsed.filter(
        (item) =>
          item?.role === "user" &&
          typeof item.id === "string" &&
          typeof item.username === "string" &&
          typeof item.email === "string" &&
          typeof item.password === "string",
      );
    }
  } catch {
    users = [];
  }

  const specialAccounts: Account[] = ROLE_ACCOUNTS.map((account) => ({
    ...account,
  }));

  return [...users, ...specialAccounts];
}

function notifyChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
//5.1 SAVESESSION
//สร้าง รับค่า ID 
function saveSession(userId: string, remember: boolean) {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  const data = JSON.stringify({ userId });

  //จดจำ
  if (remember) {
    //TRUE = Local
    localStorage.setItem(SESSION_STORAGE_KEY, data);
  } else {
    //FALSE = Session
    sessionStorage.setItem(SESSION_STORAGE_KEY, data);
  }

  notifyChange();
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      sessionStorage.getItem(SESSION_STORAGE_KEY) ??
      localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) return null;

    const session = JSON.parse(raw) as Session;
    const account = getAccounts().find((item) => item.id === session.userId);

    if (!account) return null;

    return {
      id: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
    };
  } catch {
    return null;
  }
}

export async function registerUser(values: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const username = values.username.trim();
  const email = normalize(values.email);
  const password = values.password;

  if (username.length < 4) {
    throw new Error("ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร");
  }

  if (!email.includes("@")) {
    throw new Error("กรุณากรอกอีเมลให้ถูกต้อง");
  }

  if (password.length < 4) {
    throw new Error("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
  }


  // 2 Check Username
  //
  const accounts = getAccounts();

  if 
  (accounts.some((a) => normalize(a.username) === normalize(username))) {
    throw new Error("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
  }

  if 
  (accounts.some((a) => normalize(a.email) === email)) {
    throw new Error("อีเมลนี้ถูกใช้แล้ว");
  }

  //3 Create Account
  const account: Account = {
    id: username,
    username,
    email,
    password,
    role: "user",
  };



  //4 SAVE LOCAL

  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  let saved: Account[] = [];

  try {
    //
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      //กรองข้อมูลบัญชี User? pass=string?
      saved = parsed.filter(
        (item) => item?.role === "user" && typeof item.password === "string",
      );
    }

    //error = catch save = []
  } catch {
    saved = [];
  }

  localStorage.setItem(
    ACCOUNT_STORAGE_KEY,
    JSON.stringify([...saved, account]),
  );
  //5 SAVE-SESSION
  saveSession(account.id, false);

  return {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.role,
  };
}

export async function loginLocalUser(
  identifier: string,
  password: string,
  remember = false,
): Promise<AuthUser> {
  const id = normalize(identifier);

  const account = getAccounts().find(
    (a) => normalize(a.username) === id || normalize(a.email) === id,
  );

  if (!account || account.password !== password) {
    throw new Error("ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง");
  }

  saveSession(account.id, remember);

  return {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.role,
  };
}

export function logoutLocalUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  notifyChange();
}

export const ROLE_LABELS: Record<AuthRole, string> = {
  user: "สมาชิกทั่วไป",
  admin: "ผู้ดูแลระบบ",
  staff: "เจ้าหน้าที่",
  merchant: "ร้านค้า",
};

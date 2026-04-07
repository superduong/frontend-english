/**
 * Dev: để trống → dùng `/api` (proxy Vite → backend local).
 * Production: đặt VITE_API_URL = URL gốc backend (không có /api), ví dụ https://api-xyz.railway.app
 */
const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "/api";

function authHeaders(): HeadersInit {
  const t = localStorage.getItem("token");
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (j.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "teacher";
};

export type Teacher = {
  id: number;
  user_id: number;
  display_name: string;
  bio: string;
  hourly_rate_vnd: number;
  is_available: boolean;
};

export type Booking = {
  id: number;
  student_id: number;
  teacher_profile_id: number;
  start_at: string;
  end_at: string;
  status: "pending_payment" | "confirmed" | "cancelled";
  amount_vnd: number;
  note: string;
  created_at: string;
};

export type PaymentCheckout = {
  payment_id: number;
  booking_id: number;
  amount_vnd: number;
  provider: string;
  mock_mode: boolean;
  message_vi: string;
};

export function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDt(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

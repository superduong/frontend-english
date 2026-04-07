import { useCallback, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { SiteHeader } from "./components/SiteHeader";
import { LandingPage } from "./pages/LandingPage";
import { PaymentCallbackPage } from "./pages/PaymentCallbackPage";
import { TutorsPage } from "./pages/TutorsPage";
import {
  api,
  formatDt,
  formatVnd,
  type Booking,
  type PaymentCheckout,
  type PaymentProviderId,
  type PaymentProviderItem,
  type User,
} from "./api";

function useToken(): [string | null, (t: string | null) => void] {
  const [token, setTok] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  // Stable identity — nếu không, refreshMe/useEffect phụ thuộc setToken sẽ chạy mỗi render → spam /auth/me.
  const set = useCallback((t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setTok(t);
  }, []);
  return [token, set];
}

function LoginPage({ onLoggedIn }: { onLoggedIn: (t: string) => void }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLoggedIn(r.access_token);
      nav("/tutors");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-shell__narrow">
        <div className="card">
          <h2>Đăng nhập</h2>
          <p className="muted">Tài khoản học viên — sau đó đặt lịch tại «Tìm giáo viên».</p>
          {err && <div className="error">{err}</div>}
          <form className="form" onSubmit={submit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "…" : "Đăng nhập"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onLoggedIn }: { onLoggedIn: (t: string) => void }) {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });
      const r = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLoggedIn(r.access_token);
      nav("/tutors");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-shell__narrow">
        <div className="card">
          <h2>Đăng ký học viên</h2>
          {err && <div className="error">{err}</div>}
          <form className="form" onSubmit={submit}>
            <label>Họ tên</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label>Mật khẩu (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "…" : "Tạo tài khoản"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [providers, setProviders] = useState<PaymentProviderItem[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentProviderId | "">("");
  const [qrModal, setQrModal] = useState<PaymentCheckout | null>(null);

  const load = useCallback(async () => {
    try {
      const b = await api<Booking[]>("/bookings/mine");
      setRows(b);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api<{ providers: PaymentProviderItem[] }>("/payments/providers")
      .then((r) => setProviders(r.providers.filter((p) => p.enabled)))
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (!payMethod && providers.length) {
      const d =
        providers.find((p) => p.id === "mock") ?? providers[0];
      setPayMethod(d.id);
    }
  }, [providers, payMethod]);

  async function pay(bookingId: number) {
    setErr(null);
    setInfo(null);
    setQrModal(null);
    if (!payMethod) {
      setErr("Chọn phương thức thanh toán.");
      return;
    }
    try {
      const c = await api<PaymentCheckout>(
        `/payments/bookings/${bookingId}/checkout`,
        {
          method: "POST",
          body: JSON.stringify({ provider: payMethod }),
        }
      );

      if (c.redirect_url) {
        window.location.href = c.redirect_url;
        return;
      }

      if (c.qr_image_url) {
        setQrModal(c);
        setInfo(c.message_vi);
        await load();
        return;
      }

      if (c.mock_mode) {
        await api(`/payments/${c.payment_id}/confirm-mock`, { method: "POST" });
        setInfo("Thanh toán thử thành công — buổi học đã xác nhận.");
        await load();
        return;
      }

      setInfo(c.message_vi || "Đã tạo giao dịch.");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi thanh toán");
    }
  }

  return (
    <div className="page-shell">
      <div className="page-shell__wide">
        <div className="card">
          <h2>Lịch học của tôi</h2>
          <p className="muted">
            Chọn phương thức: VNPay, MoMo, ZaloPay, QR VietQR (chuyển khoản), hoặc thử nghiệm khi bật mock.
          </p>
          {providers.length > 0 && (
            <label className="form" style={{ display: "block", marginBottom: "1rem" }}>
              <span className="muted">Phương thức thanh toán</span>
              <select
                className="form"
                style={{ marginTop: "0.35rem", width: "100%", maxWidth: "28rem" }}
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentProviderId)}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {err && <div className="error">{err}</div>}
          {info && (
            <div className="card" style={{ background: "#ecfdf5", marginBottom: "1rem" }}>
              {info}
            </div>
          )}

          {qrModal?.qr_image_url && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ marginTop: 0 }}>Quét QR chuyển khoản</h3>
              <p className="muted">{qrModal.message_vi}</p>
              <img
                src={qrModal.qr_image_url}
                alt="VietQR"
                style={{ maxWidth: "min(280px, 100%)", display: "block" }}
              />
              <button
                type="button"
                className="btn"
                style={{ marginTop: "0.75rem" }}
                onClick={() => setQrModal(null)}
              >
                Đóng
              </button>
            </div>
          )}

          {rows.length === 0 ? (
            <p className="muted">Chưa có buổi học. <Link to="/tutors">Tìm giáo viên</Link></p>
          ) : (
            <ul className="bookings-list">
              {rows.map((b) => (
                <li key={b.id} className="bookings-list__item card">
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatDt(b.start_at)}</div>
                    <div className="muted">
                      {formatVnd(b.amount_vnd)} — GV #{b.teacher_profile_id}
                    </div>
                    {b.note && <div className="muted">{b.note}</div>}
                  </div>
                  <div className="bookings-list__actions">
                    {b.status === "pending_payment" && (
                      <>
                        <span className="badge badge-warn">Chờ thanh toán</span>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => pay(b.id)}
                        >
                          Thanh toán
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <span className="badge badge-ok">Đã xác nhận</span>
                    )}
                    {b.status === "cancelled" && (
                      <span className="badge badge-muted">Đã huỷ</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useToken();
  const [user, setUser] = useState<User | null>(null);

  const refreshMe = useCallback(
    async (t: string | null) => {
      if (!t) {
        setUser(null);
        return;
      }
      try {
        const u = await api<User>("/auth/me");
        setUser(u);
      } catch {
        setToken(null);
        setUser(null);
      }
    },
    [setToken]
  );

  useEffect(() => {
    refreshMe(token);
  }, [token, refreshMe]);

  return (
    <>
      <SiteHeader
        user={user}
        onLogout={() => {
          setToken(null);
          setUser(null);
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />
        <Route path="/tutors" element={<TutorsPage token={token} />} />
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/tutors" replace />
            ) : (
              <LoginPage onLoggedIn={(t) => setToken(t)} />
            )
          }
        />
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/tutors" replace />
            ) : (
              <RegisterPage onLoggedIn={(t) => setToken(t)} />
            )
          }
        />
        <Route
          path="/bookings"
          element={
            token ? <BookingsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../api";

type VerifyResult = {
  signature_valid: boolean;
  response_code: string | null;
  message_vi: string;
  booking_confirmed: boolean;
};

export function PaymentCallbackPage() {
  const [search] = useSearchParams();
  const queryKey = search.toString();
  const queryObject = useMemo(() => {
    const o: Record<string, string> = {};
    new URLSearchParams(queryKey).forEach((value, key) => {
      o[key] = value;
    });
    return o;
  }, [queryKey]);

  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!queryObject.vnp_SecureHash) {
      setStatus("done");
      setResult({
        signature_valid: false,
        response_code: null,
        message_vi:
          "Không có tham số VNPay trên URL. Nếu bạn mở trang này trực tiếp, hãy quay lại từ cổng thanh toán.",
        booking_confirmed: false,
      });
      return;
    }

    setStatus("loading");
    setErr(null);

    fetch(`${API_BASE}/payments/verify/vnpay-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryObject),
    })
      .then(async (res) => {
        const j = (await res.json()) as VerifyResult & { detail?: unknown };
        if (!res.ok) {
          const d = j.detail;
          const msg =
            typeof d === "string"
              ? d
              : d != null
                ? JSON.stringify(d)
                : res.statusText;
          throw new Error(msg);
        }
        setResult(j);
      })
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : "Lỗi kết nối máy chủ.");
        setResult(null);
      })
      .finally(() => setStatus("done"));
  }, [queryObject]);

  const show = result;
  const okBooking = show?.booking_confirmed;
  const badSig = show && !show.signature_valid;

  return (
    <div className="page-shell">
      <div className="page-shell__narrow">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Kết quả thanh toán</h2>

          {status === "loading" && <p className="muted">Đang xác thực giao dịch…</p>}

          {err && <div className="error">{err}</div>}

          {show && !err && (
            <>
              <div
                className="card"
                style={{
                  marginBottom: "1rem",
                  background: okBooking
                    ? "#ecfdf5"
                    : badSig
                      ? "#fef2f2"
                      : "#f8fafc",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{show.message_vi}</p>
                {show.response_code != null && show.response_code !== "" && (
                  <p className="muted" style={{ marginBottom: 0, marginTop: "0.5rem" }}>
                    Mã VNPay: <code>{show.response_code}</code>
                    {show.signature_valid ? " · Chữ ký hợp lệ" : " · Chữ ký không hợp lệ"}
                  </p>
                )}
              </div>

              <details className="muted" style={{ marginBottom: "1rem" }}>
                <summary>Tham số từ VNPay (đối soát)</summary>
                <pre
                  style={{
                    fontSize: "0.8rem",
                    overflow: "auto",
                    maxHeight: "12rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {JSON.stringify(queryObject, null, 2)}
                </pre>
              </details>
            </>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/bookings" className="btn btn-primary">
              Lịch học của tôi
            </Link>
            <Link to="/" className="btn">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

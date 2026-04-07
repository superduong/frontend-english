import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  api,
  formatVnd,
  type Booking,
  type Teacher,
} from "../api";
import "./TutorsPage.css";

export function TutorsPage({ token }: { token: string | null }) {
  const [searchParams] = useSearchParams();
  const qInitial = searchParams.get("q") ?? "";

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [bookingTeacher, setBookingTeacher] = useState<Teacher | null>(null);
  const [startLocal, setStartLocal] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState(qInitial);

  const load = useCallback(async () => {
    try {
      const t = await api<Teacher[]>("/teachers");
      setTeachers(t);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi tải giáo viên");
    }
  }, []);

  useEffect(() => {
    setFilter(qInitial);
  }, [qInitial]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = filter.trim().toLowerCase();
    if (!s) return teachers;
    return teachers.filter(
      (t) =>
        t.display_name.toLowerCase().includes(s) ||
        t.bio.toLowerCase().includes(s)
    );
  }, [teachers, filter]);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingTeacher || !token) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const start = new Date(startLocal);
      await api<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          teacher_profile_id: bookingTeacher.id,
          start_at: start.toISOString(),
          note,
        }),
      });
      setMsg("Đặt lịch thành công. Mở «Lịch học» để thanh toán.");
      setBookingTeacher(null);
      setNote("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Không đặt được lịch");
    } finally {
      setBusy(false);
    }
  }

  const openBook = (t: Teacher) => {
    setBookingTeacher(t);
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    const pad = (n: number) => String(n).padStart(2, "0");
    setStartLocal(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
    setMsg(null);
    setErr(null);
  };

  return (
    <div className="tutors-page">
      <div className="tutors-hero">
        <h1 className="tutors-hero__title">Tìm giáo viên phù hợp</h1>
        <p className="tutors-hero__sub">
          Buổi học 60 phút, giá theo giờ. Đăng nhập để đặt lịch và thanh toán.
        </p>
        <label className="tutors-filter">
          <span className="tutors-filter__icon" aria-hidden />
          <input
            type="search"
            placeholder="Lọc theo tên hoặc mô tả (IELTS, giao tiếp…)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
      </div>

      {msg && <div className="tutors-flash tutors-flash--ok">{msg}</div>}
      {err && !bookingTeacher && <div className="tutors-flash tutors-flash--err">{err}</div>}

      <div className="tutors-grid">
        {filtered.map((t) => (
          <article key={t.id} className="tutor-card">
            <div
              className="tutor-card__photo"
              style={{
                background: `linear-gradient(145deg, hsl(${(t.id * 47) % 360}, 50%, 45%), hsl(${(t.id * 31) % 360}, 40%, 30%))`,
              }}
            >
              <span>{t.display_name.charAt(0)}</span>
            </div>
            <div className="tutor-card__body">
              <h2>{t.display_name}</h2>
              <p>{t.bio}</p>
              <div className="tutor-card__row">
                <span className="tutor-card__price">{formatVnd(t.hourly_rate_vnd)}/giờ</span>
                {token ? (
                  <button
                    type="button"
                    className="tutor-card__book"
                    onClick={() => openBook(t)}
                  >
                    Đặt lịch
                  </button>
                ) : (
                  <Link className="tutor-card__book tutor-card__book--link" to="/login">
                    Đăng nhập để đặt
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && !err && (
        <p className="tutors-empty">Không có giáo viên khớp bộ lọc. Thử từ khóa khác.</p>
      )}

      {bookingTeacher && (
        <div className="tutors-modal" role="dialog" aria-modal>
          <div className="tutors-modal__panel">
            <h2>Đặt: {bookingTeacher.display_name}</h2>
            {err && <div className="tutors-flash tutors-flash--err">{err}</div>}
            <form className="tutors-form" onSubmit={submitBooking}>
              <label>Bắt đầu</label>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                required
              />
              <label>Ghi chú</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="tutors-modal__actions">
                <button type="submit" className="tutor-card__book" disabled={busy}>
                  {busy ? "…" : "Xác nhận"}
                </button>
                <button
                  type="button"
                  className="tutors-modal__cancel"
                  onClick={() => setBookingTeacher(null)}
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

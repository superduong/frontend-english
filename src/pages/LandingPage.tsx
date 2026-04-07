import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatVnd, type Teacher } from "../api";
import "./LandingPage.css";

const PROMO_KEY = "linguaone-promo-dismissed";

export function LandingPage() {
  const nav = useNavigate();
  const [promo, setPromo] = useState(() => sessionStorage.getItem(PROMO_KEY) !== "1");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState("");

  const loadTeachers = useCallback(async () => {
    try {
      const t = await api<Teacher[]>("/teachers");
      setTeachers(t.slice(0, 8));
    } catch {
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  function dismissPromo() {
    sessionStorage.setItem(PROMO_KEY, "1");
    setPromo(false);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    nav(`/tutors${params}`);
  }

  return (
    <div className="landing">
      {promo && (
        <div className="landing-promo" role="region" aria-label="Ưu đãi">
          <span className="landing-promo__icon" aria-hidden />
          <p>
            <strong>Bản MVP</strong> — Đặt lịch 1-1, thanh toán thử. Momo / ZaloPay
            tích hợp sau.
          </p>
          <button
            type="button"
            className="landing-promo__cta"
            onClick={() => nav("/register")}
          >
            Bắt đầu
          </button>
          <button
            type="button"
            className="landing-promo__close"
            onClick={dismissPromo}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      )}

      <section className="landing-hero">
        <div className="landing-hero__glow" aria-hidden />
        <div className="landing-hero__grid landing-wrap">
          <div className="landing-hero__copy">
            <p className="landing-badge">
              <span>✦</span> Học cùng giáo viên phù hợp — theo lịch của bạn
            </p>
            <h1 className="landing-hero__title">
              <span className="landing-hero__title-line">Luyện tiếng Anh thật,</span>
              <span className="landing-hero__title-accent">
                tiến bộ thật.
              </span>
            </h1>
            <p className="landing-hero__lede">
              Nền tảng kết nối học viên Việt Nam với gia sư chất lượng: IELTS, giao
              tiếp, thương mại — buổi học trực tuyến 1-1, minh bạch giá.
            </p>

            <form className="landing-search" onSubmit={submitSearch}>
              <span className="landing-search__icon" aria-hidden />
              <input
                type="search"
                placeholder="Bạn muốn học gì? (ví dụ: IELTS Speaking)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Tìm khoá học hoặc mục tiêu"
              />
              <button type="submit" className="landing-search__btn">
                Tìm giáo viên
              </button>
            </form>

            <div className="landing-hero__ctas">
              <button
                type="button"
                className="landing-btn landing-btn--primary"
                onClick={() => nav("/tutors")}
              >
                Xem giáo viên
                <span aria-hidden> →</span>
              </button>
              <button
                type="button"
                className="landing-btn landing-btn--outline"
                onClick={() => nav("/register")}
              >
                Tạo tài khoản
              </button>
            </div>
          </div>

          <div className="landing-hero__visual" aria-hidden>
            <div className="landing-stack">
              <div className="landing-stack__card landing-stack__card--back" />
              <div className="landing-stack__card landing-stack__card--mid" />
              <div className="landing-stack__card landing-stack__card--front">
                <div className="landing-pip" />
                <div className="landing-stack__bar">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats landing-wrap">
        <div className="landing-stats__item">
          <strong>60′</strong>
          <span>Mỗi buổi học chuẩn hóa — dễ quản lý lịch</span>
        </div>
        <div className="landing-stats__item">
          <strong>VND</strong>
          <span>Giá hiển thị rõ — thanh toán trong app (MVP: mock)</span>
        </div>
        <div className="landing-stats__item">
          <strong>1-1</strong>
          <span>Trọng tâm giao tiếp, không đông đúc như lớp offline</span>
        </div>
        <div className="landing-stats__item">
          <strong>MVP</strong>
          <span>Sẵn sàng mở rộng video, đánh giá, matching như Uber class</span>
        </div>
      </section>

      <section className="landing-values landing-wrap">
        <h2 className="landing-section-title">Vì sao chọn nền tảng dạng này?</h2>
        <ul className="landing-values__list">
          <li>
            <span className="landing-values__icon landing-values__icon--flex" />
            <div>
              <strong>Linh hoạt</strong>
              <p>Không ép gói cố định — chọn giờ và giáo viên phù hợp (Preply / italki).</p>
            </div>
          </li>
          <li>
            <span className="landing-values__icon landing-values__icon--vn" />
            <div>
              <strong>Cho người Việt</strong>
              <p>Ưu tiên múi giờ VN, tiền VND, messaging thân thuộc (AmazingTalker).</p>
            </div>
          </li>
          <li>
            <span className="landing-values__icon landing-values__icon--goal" />
            <div>
              <strong>Mục tiêu rõ</strong>
              <p>IELTS, phỏng vấn, học thuật — tập trung “nói & dùng” (Lingoda / Cambly).</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="landing-pills landing-wrap">
        <p className="landing-pills__label">Gợi ý mục tiêu</p>
        <div className="landing-pills__row">
          {["IELTS Speaking", "Giao tiếp công việc", "Phát âm", "Thương mại"].map(
            (label) => (
              <button
                key={label}
                type="button"
                className="landing-pill"
                onClick={() => nav(`/tutors?q=${encodeURIComponent(label)}`)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </section>

      <section className="landing-featured landing-wrap">
        <div className="landing-featured__head">
          <h2 className="landing-section-title">Giáo viên gợi ý</h2>
          <Link className="landing-featured__all" to="/tutors">
            Xem tất cả →
          </Link>
        </div>
        <div className="landing-carousel">
          {teachers.map((t) => (
            <article key={t.id} className="landing-tile">
              <div
                className="landing-tile__photo"
                style={{
                  background: `linear-gradient(145deg, hsl(${(t.id * 47) % 360}, 55%, 42%), hsl(${(t.id * 31) % 360}, 45%, 28%))`,
                }}
              >
                <span className="landing-tile__initial">
                  {t.display_name.charAt(0)}
                </span>
              </div>
              <div className="landing-tile__body">
                <h3>{t.display_name}</h3>
                <p>{t.bio.slice(0, 72)}{t.bio.length > 72 ? "…" : ""}</p>
                <span className="landing-tile__price">{formatVnd(t.hourly_rate_vnd)}/giờ</span>
              </div>
              <Link className="landing-tile__link" to="/tutors">
                Đặt lịch
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-trust landing-wrap">
        <div className="landing-trust__strip">
          <div>
            <strong>Minh bạch</strong>
            <span>Giá & lịch rõ trước khi thanh toán.</span>
          </div>
          <div>
            <strong>An toàn MVP</strong>
            <span>Luồng đặt chỗ + thanh toán thử trong app.</span>
          </div>
          <div>
            <strong>Mở rộng được</strong>
            <span>Matching, video, review — như các ông lớn ngoài kia.</span>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap landing-footer__inner">
          <span className="site-header__mark" style={{ flexShrink: 0 }} aria-hidden />
          <div>
            <strong>LinguaOne</strong>
            <p>MVP học tiếng Anh 1-1 — cảm hứng từ Preply, italki, Cambly, AmazingTalker, Lingoda.</p>
          </div>
          <Link to="/tutors" className="landing-footer__cta">
            Bắt đầu học
          </Link>
        </div>
      </footer>
    </div>
  );
}

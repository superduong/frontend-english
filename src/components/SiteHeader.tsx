import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../api";
import "./SiteHeader.css";

export function SiteHeader({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  const loc = useLocation();
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const isHome = loc.pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`site-header ${transparent ? "site-header--transparent" : "site-header--solid"}`}
    >
      <div className="site-header__inner">
        <Link className="site-header__logo" to="/">
          <span className="site-header__mark" aria-hidden />
          <span className="site-header__wordmark">LinguaOne</span>
        </Link>

        <nav className="site-header__nav" aria-label="Chính">
          <Link to="/">Trang chủ</Link>
          <Link to="/tutors">Tìm giáo viên</Link>
          {user && <Link to="/bookings">Lịch học</Link>}
        </nav>

        <div className="site-header__actions">
          <Link className="site-header__compact-link" to="/tutors">
            Tìm GV
          </Link>
          {user ? (
            <>
              <span className="site-header__hi">{user.full_name}</span>
              <button
                type="button"
                className="site-header__btn site-header__btn--ghost"
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="site-header__btn site-header__btn--ghost"
                onClick={() => nav("/login")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className="site-header__btn site-header__btn--primary"
                onClick={() => nav("/register")}
              >
                Đăng ký miễn phí
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { navbarStyles as s } from "../assets/dummyStyles.jsx";
import { Logo } from "../assets/ui.jsx";
import { Zap, Settings, Menu, X, ChevronDown, CreditCard, Sun, Moon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { label: "Home", to: "/" },
  { label: "My Projects", to: "/dashboard", protected: true },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

const accountLinks = [
  { label: "Buy credits", icon: Zap, to: "/pricing" },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Billing", icon: CreditCard, to: "/pricing" },
];

const UserMenu = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("")
    : "U";

  return (
    <div className={s.userMenuWrapper}>
      <div className={s.creditsPill}>
        <Zap className={s.creditsIcon} />
        <span className={s.creditsLabel}>Credits</span>
        <span className={s.creditsNumber}>{user?.credits ?? 0}</span>
        <span className={s.plusIcon}>+</span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={s.avatar}
          aria-label="Open profile menu"
        >
          {initials}
        </button>

        {menuOpen && (
          <div className={s.dropdown}>
            <div className={s.dropdownHeader}>
              <div className={s.avatar}>{initials}</div>
              <div className={s.dropdownUserInfo}>
                <div className={s.dropdownUserName}>{user?.name || "User"}</div>
                <div className={s.dropdownUserEmail}>{user?.email || "user@example.com"}</div>
              </div>
            </div>

            <div className={s.dropdownBody}>
              {accountLinks.map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(to);
                  }}
                  className={s.dropdownItem}
                >
                  <Icon className={s.iconSm} />
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logoutUser();
                  navigate("/");
                }}
                className={s.dropdownSignOut}
              >
                <ChevronDown className={s.iconSm} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const isAuthed = Boolean(user);
  const [open, setOpen] = useState(false);
  const [isLight, setIsLight] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  const visibleLinks = links.filter((l) => !l.protected || isAuthed);

  const toggleTheme = () => {
    const nextTheme = isLight ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
    setIsLight(nextTheme === "light");
  };

  return (
    <>
      <nav className={s.root}>
        <div className={s.container}>
          <Logo />

          <div className={s.centerLinks}>
            {visibleLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `${s.navLinkBase} ${isActive ? s.navLinkActive : s.navLinkInactive}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className={s.desktopRight}>
            {isAuthed ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className={s.signInLink}>
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className={`${s.btnPrimary} text-[13px] px-4 py-2`}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className={s.hamburger}
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className={s.hamburgerIcon} /> : <Menu className={s.hamburgerIcon} />}
          </button>
        </div>

        {open && (
          <div className={s.mobileMenu}>
            {visibleLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={s.mobileLink}
              >
                {l.label}
              </NavLink>
            ))}

            <div className={s.mobileDivider}>
              {isAuthed ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logoutUser();
                    navigate("/");
                  }}
                  className={s.mobileSignOut}
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className={s.mobileLink}>
                    Sign in
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/register");
                    }}
                    className={`${s.mobileGetStarted} ${s.btnPrimary}`}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
        title={`Switch to ${isLight ? "dark" : "light"} mode`}
        className="theme-toggle-button theme-toggle-floating"
      >
        <span className="theme-toggle-icon-frame">
          {isLight ? (
            <Moon aria-hidden="true" className="theme-toggle-icon theme-toggle-moon" />
          ) : (
            <Sun aria-hidden="true" className="theme-toggle-icon theme-toggle-sun" />
          )}
        </span>
      </button>
    </>
  );
};

export default Navbar;
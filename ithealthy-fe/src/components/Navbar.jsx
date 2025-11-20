import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../context/AuthContext";
import { CircleUserRound, LogOut, User, ShoppingCart } from "lucide-react";

const Navbar = ({ onSubmenuToggle }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isHomePage = location.pathname === "/";

  // Các route thuộc nhóm "Our bowls"
  const isOurBowlsPage = [
    "/signature-bowls",
    "/createyourbowl",
    "/UserBowlPage",
  ].some((path) => location.pathname.startsWith(path));

  // submenu chỉ mở khi đang ở trang our bowls + user đã click Our bowls
  const shouldShowSubmenu = isOurBowlsPage && activeMenu === "menu";

  // Detect scroll chỉ ở homepage
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 50);
      }
    };

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  const handleLogout = () => {
    logout();
    navigate("/login-user");
  };

  const handleMenuClick = (menu) => {
    if (menu === "menu") {
      const newState = activeMenu === "menu" ? null : "menu";
      setActiveMenu(newState);
      if (onSubmenuToggle) {
        onSubmenuToggle(newState === "menu");
      }
    } else {
      setActiveMenu(null);
      if (onSubmenuToggle) {
        onSubmenuToggle(false);
      }
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`navbar-wrapper ${
        isHomePage
          ? isScrolled
            ? "navbar-scrolled"
            : "navbar-transparent"
          : ""
      }`}
    >
      <div className="navbar-container">
        <div className="navbar-main">
          {/* Logo */}
          <a
            href="/"
            className="navbar-logo"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setActiveMenu(null);
              if (onSubmenuToggle) onSubmenuToggle(false);
            }}
          >
            <img
              src="/img/logo.png"
              className="logo-ithealthy"
              alt="ITHealthy"
            />
          </a>

          {/* Main Navigation */}
          <nav className="navbar-nav">
            <ul className="nav-menu">
              <li
                className={`nav-item ${isActive("/calories") ? "active" : ""}`}
              >
                <a
                  href="/calories"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/calories");
                    handleMenuClick("none");
                  }}
                >
                  Calories calculator
                </a>
              </li>

              <li
                className={`nav-item ${
                  isActive("/signature-bowls") ||
                  isActive("/createyourbowl") ||
                  isActive("/UserBowlPage")
                    ? "active"
                    : ""
                }`}
              >
                <a
                  href="/menu"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signature-bowls");
                    handleMenuClick("menu");
                  }}
                >
                  Our bowls
                </a>
              </li>

              <li
                className={`nav-item ${isActive("/aboutus") ? "active" : ""}`}
              >
                <a
                  href="/aboutus"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/aboutus");
                    handleMenuClick("none");
                  }}
                >
                  About us
                </a>
              </li>

              <li className={`nav-item ${isActive("/stores") ? "active" : ""}`}>
                <a
                  href="/stores"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/stores");
                    handleMenuClick("none");
                  }}
                >
                  Stores
                </a>
              </li>

              <li className={`nav-item ${isActive("/blogs") ? "active" : ""}`}>
                <a
                  href="/blogs"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/blogs");
                    handleMenuClick("none");
                  }}
                >
                  Blogs
                </a>
              </li>

              {/* Ngôn ngữ */}
              <li className="lang-item">
                <a href="#vi" onClick={(e) => e.preventDefault()}>
                  <span className="lang-flag">
                    <img
                      src="data:image/svg+xml;utf8,%3Csvg width='21' height='15' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='a'%3E%3Cstop stop-color='%23EA403F' offset='0%25'/%3E%3Cstop stop-color='%23D82827' offset='100%25'/%3E%3C/linearGradient%3E%3ClinearGradient x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='b'%3E%3Cstop stop-color='%23FFFE4E' offset='0%25'/%3E%3Cstop stop-color='%23FFFE38' offset='100%25'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='none'%3E%3Cpath fill='url(%23a)' d='M0 0h21v15H0z'/%3E%3Cpath fill='url(%23b)' d='M10.5 9.255l-2.645 1.886.976-3.099L6.22 6.11l3.247-.029L10.5 3l1.032 3.08 3.248.03-2.61 1.932.975 3.099z'/%3E%3C/g%3E%3C/svg%3E"
                      alt="VI"
                    />
                  </span>
                  <span className="lang-code">VI</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Auth & Cart */}
          <div className="navbar-auth">
            <button
              className="cart-btn"
              onClick={() => navigate("/carts")}
              title="Giỏ hàng"
            >
              <ShoppingCart
                size={24}
                color={isHomePage && !isScrolled ? "#ffffff" : "#00B389"}
              />
            </button>

            {user ? (
              <div className="user-menu-wrapper">
                <img
                  src={user.avatar || "/img/default-avatar.png"}
                  alt="User Avatar"
                  className="user-avatar"
                  onClick={() =>
                    setActiveMenu(activeMenu === "user" ? null : "user")
                  }
                />

                {activeMenu === "user" && (
                  <div className="user-dropdown">
                    <p className="user-name">
                      {user.fullname || user.username}
                    </p>

                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      <User size={18} /> Thông tin cá nhân
                    </button>

                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="auth-btn"
                onClick={() => navigate("/login-user")}
              >
                <CircleUserRound
                  size={28}
                  color={isHomePage && !isScrolled ? "#ffffff" : "#00B389"}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submenu - Our Bowls (luôn render, nhưng mượt mà + chỉ mở khi ở our bowls) */}
      <div
        className={`submenu-container ${
          shouldShowSubmenu ? "submenu-open" : "submenu-closed"
        } ${isOurBowlsPage ? "" : "submenu-disabled"}`}
      >
        <nav className="submenu-nav">
          <ul className="submenu-menu">
            <li
              className={`submenu-item ${
                isActive("/signature-bowls") ? "active" : ""
              }`}
            >
              <a
                href="/menu/sou-made-bowls"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signature-bowls");
                }}
              >
                Signature Bowls
              </a>
            </li>
            <li
              className={`submenu-item ${
                isActive("/createyourbowl") ? "active" : ""
              }`}
            >
              <a
                href="/build-your-own"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/createyourbowl");
                }}
              >
                Create Your Bowl
              </a>
            </li>
            <li
              className={`submenu-item ${
                isActive("/UserBowlPage") ? "active" : ""
              }`}
            >
              <a
                href="/menu/plan-your-bowls"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/UserBowlPage");
                }}
              >
                Bowl Planner
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;

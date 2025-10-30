import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Lấy đường dẫn hiện tại

  const handleMenuClick = (menu) => {
    if (menu === "menu") {
      setActiveMenu((prev) => (prev === "menu" ? null : "menu"));
    } else {
      setActiveMenu(null);
    }
  };

  // ✅ Hàm check active theo đường dẫn
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-wrapper">
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
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="175"
              height="28"
              viewBox="0 0 175 28"
              fill="none"
            >
              <text
                x="10"
                y="20"
                fill="#00B389"
                fontSize="20"
                fontWeight="bold"
              >
                IT_Healthy
              </text>
            </svg>
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
                    setActiveMenu(null);
                  }}
                >
                  Calories calculator
                </a>
              </li>

              <li
                className={`nav-item ${activeMenu === "menu" ? "active" : ""}`}
              >
                <a
                  href="/menu"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signature-bowls"); // chuyển hướng ngay
                    handleMenuClick("menu"); // mở submenu
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
                    setActiveMenu(null);
                  }}
                >
                  About us
                </a>
              </li>

              {/* <li
                className={`nav-item ${isActive("/catering") ? "active" : ""}`}
              >
                <a
                  href="/catering"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/catering");
                    setActiveMenu(null);
                  }}
                >
                  Catering
                </a>
              </li> */}

              <li className={`nav-item ${isActive("/stores") ? "active" : ""}`}>
                <a
                  href="/stores"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/stores");
                    setActiveMenu(null);
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
                    setActiveMenu(null);
                  }}
                >
                  Blogs
                </a>
              </li>
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
        </div>
      </div>

      {/* Submenu - Our Bowls */}
      {activeMenu === "menu" && (
        <div className="submenu-container">
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
                  isActive("/menu/BowlPlanner") ? "active" : ""
                }`}
              >
                <a
                  href="/menu/plan-your-bowls"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/BowlPlanner");
                  }}
                >
                  Bowl Planner
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;

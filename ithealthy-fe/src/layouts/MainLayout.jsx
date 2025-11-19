// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function MainLayout() {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative bg-[#F8F4E9] min-h-screen">
      <Navbar onSubmenuToggle={setSubmenuOpen} />
      {/* 
        Truyền prop xuống page hiện tại.
        Đặc biệt MenuPage (ProductPage) sẽ dùng để đẩy thanh category xuống khi submenu mở.
      */}
      <Outlet context={{ submenuOpen }} key={location.pathname} />
      <Footer />
    </div>
  );
}

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ===== Sidebar ===== */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* ===== Main content ===== */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Nội dung trang con */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* ✅ Route con sẽ hiển thị ở đây */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

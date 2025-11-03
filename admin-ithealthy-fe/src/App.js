import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StoreManagement from "./pages/admin/StoreManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập riêng */}
        <Route path="/" element={<AdminLogin />} />

        {/* Tất cả các trang trong hệ thống admin đều dùng chung layout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staffs" element={<StaffManagement />} />
          <Route path="/admin/stores" element={<StoreManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StoreManagement from "./pages/admin/StoreManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import ProductManagement from "./pages/admin/ProductManagement";

import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <Router>
      {/* Toast container chỉ cần 1 lần, đặt ở đây để toàn app dùng */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Trang đăng nhập riêng */}
        <Route path="/" element={<AdminLogin />} />

        {/* Tất cả các trang trong hệ thống admin đều dùng chung layout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staffs" element={<StaffManagement />} />
          <Route path="/admin/stores" element={<StoreManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

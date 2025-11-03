import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";

const ProtectedAdmin = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
};

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedAdmin>
          <AdminDashboard />
        </ProtectedAdmin>
      }
    />
  </Routes>
);

export default AdminRoutes;

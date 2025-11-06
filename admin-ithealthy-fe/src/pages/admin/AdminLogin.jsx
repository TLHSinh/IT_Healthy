// src/pages/admin/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import bgLogin from "../../assets/bg_login.jpg"; // import ảnh

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra remember login
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setForm({ email: savedEmail, password: savedPassword, remember: true });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminApi.login(form);

      const role = res.data.staff?.roleStaff?.toLowerCase() || res.data.role?.toLowerCase();
      if (role !== "admin") {
        toast.error("Tài khoản này không có quyền quản trị!");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", res.data.accessToken);
      localStorage.setItem("adminInfo", JSON.stringify(res.data.staff));

      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
        localStorage.setItem("rememberedPassword", form.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      toast.success("Đăng nhập thành công!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.Message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Nội dung login */}
      <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-[400px]">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700 text-center mb-4">
            ITHealthy Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống quản trị</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-gray-700 block mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email..."
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-700 block mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu..."
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="mr-2"
              />
              Ghi nhớ đăng nhập
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          © 2025 IT Healthy | Admin System
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

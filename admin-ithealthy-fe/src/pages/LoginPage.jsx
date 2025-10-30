//import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import HashLoader from "react-spinners/HashLoader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";


import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import {
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineHeart,
} from "react-icons/hi";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ gọi hàm từ context

  const [showPassword, setShowPassword] = useState(false);
  
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({
        Email: formData.email,
        Password: formData.password,
      });

      // ✅ gọi hàm login từ AuthContext
      login(res.data);

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      toast.error("Sai email hoặc mật khẩu!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-gray-50">
      {/* LEFT: Login Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-20 bg-white shadow-lg">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-r from-green-600 via-green-500 to-teal-400 text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-md shadow-md
">
                IT
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập hệ thống</h2>
            <p className="text-gray-500 text-sm mt-1">
              Chào mừng bạn quay lại! Hãy chọn phương thức đăng nhập:
            </p>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-5">
            <button
              type="button"
              className="flex-1 flex items-center justify-center border border-gray-200 rounded-md py-2 hover:bg-gray-50"
            >
              <FcGoogle size={20} className="mr-2" />
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center border border-gray-200 rounded-md py-2 hover:bg-gray-50"
            >
              <FaFacebook size={20} color="#1877F2" className="mr-2" />
              Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-400">hoặc đăng nhập bằng email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4 relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-green-500 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                          </button>
                        </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" /> Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-green-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 via-green-400 to-teal-400 text-white font-semibold py-2 rounded-md shadow-lg hover:brightness-110 hover:scale-[1.02] transition-all duration-300"
            >
              {loading ? <HashLoader size={30} color="#fff" /> : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-green-600 font-medium">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>

    
      {/* RIGHT: Gradient + Feature list + Background image */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-teal-400 to-green-400"></div>

        {/* Ảnh nền với overlay mờ */}
        <img
          src="/Designer.png" // 👉 thay bằng đúng đường dẫn ảnh của bạn
          alt="IT-Healthy Food"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />

        {/* Lớp đổ bóng nhẹ để chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

        {/* Hiệu ứng ánh sáng mờ */}
        <div className="absolute -right-20 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-28 bottom-10 w-56 h-56 rounded-full bg-white/5 blur-2xl"></div>

        {/* Nội dung */}
        <div className="relative z-10 max-w-md w-full text-white space-y-8">
          {/* Item 1 */}
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineClipboardList size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Quản lý thực đơn thông minh</h4>
              <p className="text-white/90 text-sm">
                Giúp bạn tổ chức bữa ăn và đạt hiệu quả tối đa
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineChartBar size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Theo dõi calo và sức khỏe dễ dàng</h4>
              <p className="text-white/90 text-sm">
                Biến dữ liệu thô thành những insight trực quan
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineChatAlt2 size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Giao diện thân thiện</h4>
              <p className="text-white/90 text-sm">
                Thiết kế trực quan, hiện đại và dễ sử dụng
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineHeart size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Sống khỏe – Làm việc hiệu quả</h4>
              <p className="text-white/90 text-sm">
                Cân bằng giữa sức khỏe và hiệu suất công việc
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

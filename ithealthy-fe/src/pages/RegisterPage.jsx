import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { HashLoader } from "react-spinners";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import {
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineHeart,
} from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      await authApi.register({
        FullName: formData.fullName,
        Email: formData.email,
        Password: formData.password,
        Phone: formData.phone,
      });
      toast.success("🎉 Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-gray-50">
      {/* LEFT: Gradient + Features */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-teal-400 to-green-400"></div>
        <img
          src="/Designer.png"
          alt="IT-Healthy Food"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute -right-20 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-28 bottom-10 w-56 h-56 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative z-10 max-w-md w-full text-white space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineClipboardList size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Tạo tài khoản dễ dàng</h4>
              <p className="text-white/90 text-sm">
                Chỉ vài bước đơn giản để bắt đầu sử dụng hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineChartBar size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Theo dõi tiến trình của bạn</h4>
              <p className="text-white/90 text-sm">
                Cập nhật liên tục để cải thiện hiệu quả và sức khỏe
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineChatAlt2 size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Hỗ trợ tận tâm</h4>
              <p className="text-white/90 text-sm">
                Đội ngũ luôn sẵn sàng giúp bạn giải đáp thắc mắc
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-lg backdrop-blur-sm">
              <HiOutlineHeart size={40} />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Trải nghiệm liền mạch</h4>
              <p className="text-white/90 text-sm">
                Giao diện thống nhất, thân thiện và trực quan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Register Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-20 bg-white shadow-lg">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-r from-green-600 via-green-500 to-teal-400 text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-md shadow-md">
                IT
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản mới</h2>
            <p className="text-gray-500 text-sm mt-1">
              Hãy điền thông tin của bạn để bắt đầu hành trình mới!
            </p>
          </div>

          {/* Social Register */}
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
              <span className="bg-white px-2 text-gray-400">hoặc đăng ký bằng email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="mb-6 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-green-500 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
              </button>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 via-green-400 to-teal-400 text-white font-semibold py-2 rounded-md shadow-lg hover:brightness-110 hover:scale-[1.02] transition-all duration-300"
            >
              {loading ? <HashLoader size={30} color="#fff" /> : "Đăng ký"}
            </button>
            
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Đã có tài khoản?{" "}
            <Link to="/login-user" className="text-green-600 font-medium">
              Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </section>
  );
}

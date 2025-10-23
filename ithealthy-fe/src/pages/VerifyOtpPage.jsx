import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; // lấy email từ trang đăng ký
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      navigate("/register");
      return;
    }

    if (otp.trim().length === 0) {
      toast.warning("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      setLoading(true);
      await authApi.verifyOtp({
        Email: email,
        Otp: otp,
      });
      toast.success("Xác thực OTP thành công!");
      navigate("/login");
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleVerify}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Xác thực OTP
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Mã OTP đã được gửi đến email:{" "}
          <span className="font-medium text-blue-600">{email}</span>
        </p>

        <input
          type="text"
          placeholder="Nhập mã OTP gồm 6 chữ số"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-200 p-3 rounded-md text-center tracking-widest focus:outline-none focus:border-blue-500"
          maxLength={6}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 text-white font-semibold py-2 mt-6 rounded-md shadow-md hover:scale-[1.02] transition-all duration-300"
        >
          {loading ? <HashLoader size={30} color="#fff" /> : "Xác nhận OTP"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Chưa nhận được mã?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Đăng ký lại
          </span>
        </p>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import clsx from "clsx";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; // Lấy email từ trang đăng ký

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendTime, setResendTime] = useState(0);
  const [resending, setResending] = useState(false); // trạng thái gửi lại mã

  // --- Hàm xử lý nhập từng ô OTP ---
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus ô kế tiếp
    if (value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  // --- Gửi lại OTP ---
  const handleResend = async () => {
    if (resendTime > 0 || resending) return;

    try {
      setResending(true);
      await authApi.resendOtp({ Email: email });
      toast.info("🔄 Mã OTP mới đã được gửi đến email của bạn!");
      setResendTime(60);
    } catch (err) {
      toast.error("Không thể gửi lại mã OTP, vui lòng thử lại sau!");
    } finally {
      setResending(false);
    }
  };

  // --- Đếm ngược resend OTP ---
  useEffect(() => {
    if (resendTime > 0) {
      const timer = setInterval(() => {
        setResendTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTime]);

  // --- Xác thực OTP ---
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      navigate("/register");
      return;
    }

    if (code.trim().length < 6) {
      toast.warning("Vui lòng nhập đủ 6 chữ số OTP!");
      return;
    }

    try {
      setLoading(true);
      await authApi.verifyOtp({
        Email: email,
        Otp: code,
      });
      toast.success("✅ Xác thực OTP thành công!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setShake(true);
      toast.error(
        err.response?.data?.message ||
          "❌ Mã OTP không hợp lệ hoặc đã hết hạn!"
      );
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <form
        onSubmit={handleVerify}
        className={clsx(
          "bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100 transition-all duration-300",
          shake && "animate-shake"
        )}
      >
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">
          Xác thực OTP
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Mã xác thực đã được gửi đến{" "}
          <span className="font-medium text-blue-600">{email}</span>
        </p>

        {/* Ô nhập OTP */}
        <div className="flex justify-between mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleOtpChange(e, i)}
              className="w-12 h-14 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            />
          ))}
        </div>

        {/* Nút xác nhận OTP */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-300"
        >
          {loading ? <HashLoader size={28} color="#fff" /> : "Xác nhận OTP"}
        </button>

        {/* Đếm ngược & Gửi lại OTP */}
        <div className="text-center text-sm text-gray-600 mt-6">
          {resendTime > 0 ? (
            <p>
              ⏳ Bạn có thể gửi lại mã sau{" "}
              <span className="text-blue-600 font-semibold">
                {resendTime}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className={clsx(
                "font-medium mt-1",
                resending
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:underline"
              )}
            >
              {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

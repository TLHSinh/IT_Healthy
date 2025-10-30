import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login-user");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 relative">
      <h1 className="text-3xl font-bold text-gray-700">TRANG CHỦ</h1>

      {/* Nút trên góc phải */}
      <div className="absolute top-5 right-5">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">
              Xin chào, {user.fullName || "Người dùng"} 👋
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/login-user"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}

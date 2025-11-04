import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Store,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import HELogo from "../../assets/HE.png";


const AdminSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // 🧠 Giữ mở khi đang ở trang con
  useEffect(() => {
    if (
      location.pathname.includes("/admin/users") ||
      location.pathname.includes("/admin/staffs")
    ) {
      setIsAccountOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/");
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-white shadow-lg transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="w-full border-b bg-white overflow-hidden h-28 flex items-center justify-center">
        {isOpen ? (
          <img
            src={HELogo}
            alt="ITHealthy Logo"
            className="w-full h-full object-fill transition-all duration-300"
          />
        ) : (
          <span className="text-green-600 font-bold text-3xl transition-all duration-300">
            IT
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {/* Trang chủ */}
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive
                ? "bg-orange-100 text-orange-600 font-semibold"
                : "text-gray-700 hover:bg-orange-50"
            }`
          }
        >
          <LayoutDashboard size={20} />
          {isOpen && <span>Trang chủ</span>}
        </NavLink>

        {/* Quản lý Tài khoản */}
        <div
          className={`flex flex-col px-3 py-2 rounded-lg transition cursor-pointer ${
            isAccountOpen ? "bg-orange-50" : "hover:bg-orange-50"
          }`}
        >
          {/* Tiêu đề */}
          <div
            className="flex items-center justify-between"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              {isOpen && <span>Quản lý Tài khoản</span>}
            </div>
            {isOpen &&
              (isAccountOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </div>

          {/* Submenu có hiệu ứng mượt */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isAccountOpen && isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col pl-8 space-y-1">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Quản lý Người dùng
              </NavLink>
              <NavLink
                to="/admin/staffs"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Quản lý Nhân viên
              </NavLink>
            </div>
          </div>
        </div>

        {/* Quản lý Cửa hàng */}
        <NavLink
          to="/admin/stores"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive
                ? "bg-orange-100 text-orange-600 font-semibold"
                : "text-gray-700 hover:bg-orange-50"
            }`
          }
        >
          <Store size={20} />
          {isOpen && <span>Quản lý Cửa hàng</span>}
        </NavLink>

         <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive
                ? "bg-orange-100 text-orange-600 font-semibold"
                : "text-gray-700 hover:bg-orange-50"
            }`
          }
        >
          <Package size={20} />
          {isOpen && <span>Quản lý Sản Phẩm</span>}
        </NavLink>
      </nav>

      
    </aside>
  );
};

export default AdminSidebar;

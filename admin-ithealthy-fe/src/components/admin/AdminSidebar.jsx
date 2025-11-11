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
  Boxes,
} from "lucide-react";
import HELogo from "../../assets/HE.png";

const AdminSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  // Giữ mở menu khi đang ở trang con
  useEffect(() => {
    if (location.pathname.includes("/admin/users") || location.pathname.includes("/admin/staffs")) {
      setIsAccountOpen(true);
    }
    if (
      //location.pathname.includes("/admin/products") ||
      location.pathname.includes("/admin/category") ||
      location.pathname.includes("/admin/category-ing")
    ) {
      setIsProductOpen(true);
    }
    if (location.pathname.includes("/admin/inventory")) {
      setIsWarehouseOpen(true);
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
      <div
        className="w-full border-b bg-white overflow-hidden h-28 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all duration-300"
        onClick={() => navigate("/admin/dashboard")}
      >
        {isOpen ? (
          <img src={HELogo} alt="ITHealthy Logo" className="w-full h-full object-fill" />
        ) : (
          <span className="text-green-600 font-bold text-3xl">IT</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {/* Dashboard */}
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

        {/* Quản lý tài khoản */}
        <div
          className={`flex flex-col px-3 py-2 rounded-lg transition cursor-pointer ${
            isAccountOpen ? "bg-orange-50" : "hover:bg-orange-50"
          }`}
        >
          <div className="flex items-center justify-between" onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <div className="flex items-center gap-3">
              <Users size={20} />
              {isOpen && <span>Quản lý Tài khoản</span>}
            </div>
            {isOpen && (isAccountOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </div>

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
                    isActive ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Người dùng
              </NavLink>
              <NavLink
                to="/admin/staffs"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Nhân viên
              </NavLink>
            </div>
          </div>
        </div>

        {/* Cửa hàng */}
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

        {/* Sản phẩm */}
        <div
          className={`flex flex-col px-3 py-2 rounded-lg transition cursor-pointer ${
            isProductOpen ? "bg-orange-50" : "hover:bg-orange-50"
          }`}
        >
          <div className="flex items-center justify-between" onClick={() => setIsProductOpen(!isProductOpen)}>
            <div className="flex items-center gap-3">
              <Package size={20} />
              {isOpen && <span>Quản lý Danh Mục</span>}
            </div>
            {isOpen && (isProductOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isProductOpen && isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col pl-8 space-y-1">
              <NavLink
                to="/admin/category"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Danh mục sản phẩm
              </NavLink>
              <NavLink
                to="/admin/category-ing"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-700 hover:bg-orange-50"
                  }`
                }
              >
                Danh mục nguyên liệu
              </NavLink>
            </div>
          </div>
        </div>

        {/* Kho hàng */}
<div
  className={`flex flex-col px-3 py-2 rounded-lg transition cursor-pointer ${
    isWarehouseOpen ? "bg-orange-50" : "hover:bg-orange-50"
  }`}
>
  {/* Tiêu đề */}
  <div
    className="flex items-center justify-between"
    onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
  >
    <div className="flex items-center gap-3">
      <Boxes size={20} />
      {isOpen && <span>Quản lý Sản phẩm</span>}
    </div>
    {isOpen &&
      (isWarehouseOpen ? (
        <ChevronUp size={16} />
      ) : (
        <ChevronDown size={16} />
      ))}
  </div>

  {/* Submenu mượt, không bị cắt */}
  <div
    className={`overflow-hidden transition-all duration-300 ease-in-out ${
      isWarehouseOpen && isOpen
        ? "max-h-[500px] opacity-100 mt-2"
        : "max-h-0 opacity-0"
    }`}
  >
    <div className="flex flex-col pl-8 space-y-1">
      <NavLink
        to="/admin/products"
        className={({ isActive }) =>
          `px-3 py-2 rounded-lg transition ${
            isActive
              ? "bg-orange-100 text-orange-600 font-semibold"
              : "text-gray-700 hover:bg-orange-50"
          }`
        }
      >
        Quản lý Sản phẩm
      </NavLink>

      <NavLink
        to="/admin/ingredients"
        className={({ isActive }) =>
          `px-3 py-2 rounded-lg transition ${
            isActive
              ? "bg-orange-100 text-orange-600 font-semibold"
              : "text-gray-700 hover:bg-orange-50"
          }`
        }
      >
        Quản lý Nguyên liệu
      </NavLink>
      

      

      

    </div>
  </div>
</div>

      </nav>

     
    </aside>
  );
};

export default AdminSidebar;

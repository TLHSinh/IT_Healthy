import React, { useState, useEffect, useRef } from "react";
import { Menu, User, ChevronDown, ChevronUp } from "lucide-react";

const AdminHeader = ({ toggleSidebar }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [staff, setStaff] = useState(null);
  const menuRef = useRef(null);

  // Lấy thông tin nhân viên từ localStorage
  useEffect(() => {
    const staffData = localStorage.getItem("adminInfo");
    if (staffData) setStaff(JSON.parse(staffData));
  }, []);

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/";
  };

  return (
    <>
      <header className="flex items-center justify-between bg-white shadow px-6 py-6 relative z-40">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-orange-500 transition"
          >
            <Menu size={28} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Hệ thống quản lý IT Healthy
          </h1>
        </div>

        {/* Right side */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 text-gray-700 font-medium hover:text-green-500 transition"
          >
            
            <span>{staff?.fullName || "Nhân viên"}</span>
            {showMenu ? (
              <ChevronUp size={25} />
            ) : (
              <ChevronDown size={25} />
            )}
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => {
                  setShowProfile(true);
                  setShowMenu(false);
                }}
              >
                Thông tin cá nhân
              </button>
              <hr className="border-gray-200" />
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal hiển thị thông tin nhân viên */}
      {showProfile && staff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] relative animate-fadeIn">
            <h2 className="text-xl font-semibold text-center text-indigo-600 mb-4">
              Thông tin nhân viên
            </h2>

            <div className="space-y-3 text-gray-700">
              <p><strong>Họ tên:</strong> {staff.fullName}</p>
              <p><strong>Email:</strong> {staff.email}</p>
              <p><strong>Chức vụ:</strong> {staff.roleStaff}</p>
              <p><strong>Ngày vào làm:</strong> {new Date(staff.hireDate).toLocaleDateString()}</p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;

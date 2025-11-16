import React, { useState, useEffect, useRef } from "react";
import { Menu, User, ChevronDown, ChevronUp,  Mail, Briefcase, CalendarDays, X, UserCircle2, LogOut } from "lucide-react";

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
            <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fadeIn overflow-hidden">
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-gray-700 hover:bg-indigo-50 transition"
                onClick={() => {
                  setShowProfile(true);
                  setShowMenu(false);
                }}
              >
                <UserCircle2 className="text-black" size={18} />
                Thông tin cá nhân
              </button>
              <hr className="border-gray-200" />
              <button
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal hiển thị thông tin nhân viên */}
      {showProfile && staff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl p-8 w-[420px] relative animate-fadeIn border border-indigo-100">
            
            {/* Nút đóng */}
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 transition"
            >
              <X size={22} />
            </button>

            {/* Ảnh đại diện + tiêu đề */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {staff.fullName?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-semibold text-indigo-700 mt-3">
                {staff.fullName}
              </h2>
              <p className="text-gray-500 text-sm">Nhân viên tại hệ thống</p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Mail className="text-indigo-500" size={18} />
                  <span className="font-medium">Email:</span>
                </div>
                <span>{staff.email}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-indigo-500" size={18} />
                  <span className="font-medium">Chức vụ:</span>
                </div>
                <span>{staff.roleStaff}</span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-indigo-500" size={18} />
                  <span className="font-medium">Ngày vào làm:</span>
                </div>
                <span>{new Date(staff.hireDate).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowProfile(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition"
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

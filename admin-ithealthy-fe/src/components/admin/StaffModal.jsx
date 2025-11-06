import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { EyeIcon, EyeOff, X, UserPlus, Edit3 } from "lucide-react";

const StaffModal = ({ staff, isCreate = false, stores = [], onClose, onSave, isView = false }) => {
  const [form, setForm] = useState({
    staffId: null,
    fullName: "",
    email: "",
    phone: "",
    roleStaff: "staff",
    isActive: true,
    hireDate: "",
    storeId: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isCreate && staff) {
      setForm({
        staffId: staff.staffId,
        fullName: staff.fullName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        roleStaff: staff.roleStaff || "staff",
        isActive: staff.isActive ?? true,
        hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().slice(0, 10) : "",
        storeId: staff.storeId || "",
        password: "",
      });
    } else {
      setForm({
        staffId: null,
        fullName: "",
        email: "",
        phone: "",
        roleStaff: "staff",
        isActive: true,
        hireDate: "",
        storeId: "",
        password: "",
      });
    }
  }, [staff, isCreate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation cơ bản trên client
  if (!form.fullName || !form.email) {
    toast.error("Vui lòng nhập họ tên và email");
    return;
  }
  if (!form.storeId) {
    toast.error("Vui lòng chọn cửa hàng");
    return;
  }

  setSaving(true);
  try {
    const result = await onSave(form, isCreate);
    if (result.success) {
      onClose();
    }
  } finally {
    setSaving(false);
  }
};

  if (!staff && !isCreate && !isView) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
            {isCreate ? (
              <>
                <UserPlus size={20} /> Thêm Nhân viên
              </>
            ) : isView ? (
              <>
                <EyeIcon size={20} /> Xem thông tin Nhân viên
              </>
            ) : (
              <>
                <Edit3 size={20} /> Cập nhật Nhân viên
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Họ tên</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                readOnly={isView}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                readOnly={isView}
              />
            </div>
          </div>

          {/* SĐT & Cửa hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                readOnly={isView}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cửa hàng</label>
              <select
                name="storeId"
                value={form.storeId}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                disabled={isView}
              >
                <option value="">-- Chọn cửa hàng --</option>
                {stores.map((s) => (
                  <option key={s.storeId} value={s.storeId}>
                    {s.storeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vai trò & Ngày vào */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Vai trò</label>
              <select
                name="roleStaff"
                value={form.roleStaff}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                disabled={isView}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Ngày vào</label>
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none transition"
                disabled={isView}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          {!isView && (
            <div className="relative">
              <label className="text-sm font-medium text-gray-600">
                Mật khẩu (để trống nếu không đổi)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 p-2.5 rounded-lg outline-none pr-10 transition"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-indigo-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          )}

          {/* Checkbox active */}
          <div className="flex items-center gap-3 mt-2">
            <input
              id="active"
              name="isActive"
              type="checkbox"
              checked={!!form.isActive}
              onChange={handleChange}
              disabled={isView}
              className="w-4 h-4 accent-indigo-600"
            />
            <label htmlFor="active" className="text-gray-700">
              Đang làm việc
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              {isView ? "Đóng" : "Hủy"}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : isCreate ? "Tạo mới" : "Lưu"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;

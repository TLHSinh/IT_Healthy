import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { adminApi } from "../../api/adminApi";
import { UserPlus, EyeIcon, Edit3, EyeOff } from "lucide-react";

const UsersModal = ({ isOpen, onClose, user, onSave, isCreate, isView }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    passwordHash: "",
    gender: "M",
    dob: "",
    roleUser: "User",
    isActive: true,
    avatarFile: null,
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Load dữ liệu user vào form
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        passwordHash: "",
        gender: user.gender === "F" ? "F" : "M",
        dob: user.dob ? user.dob.split("T")[0] : "",
        roleUser: user.roleUser || "User",
        isActive: user.isActive ?? true,
        avatarFile: null,
      });
      setPreview(user.avatar || null);
    } else {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        passwordHash: "",
        gender: "M",
        dob: "",
        roleUser: "User",
        isActive: true,
        avatarFile: null,
      });
      setPreview(null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      const file = files[0];
      setForm({ ...form, avatarFile: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || (isCreate && !form.passwordHash)) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    try {
      let res;
      if (user) {
        res = await adminApi.updateCustomer(user.customerId, form);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        res = await adminApi.createCustomer(form);
        toast.success("Thêm người dùng thành công!");
      }

      onSave(res);
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi lưu người dùng!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl relative shadow-2xl border border-gray-200 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
            {isCreate ? (
              <>
                <UserPlus size={20} /> Thêm Người dùng
              </>
            ) : isView ? (
              <>
                <EyeIcon size={20} /> Xem thông tin Người dùng
              </>
            ) : (
              <>
                <Edit3 size={20} /> Cập nhật Người dùng
              </>
            )}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <AiOutlineClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Họ tên *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Nhập họ tên"
                required
                disabled={isView}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="example@email.com"
                disabled={isView}
              />
            </div>
          </div>

          {/* SĐT + Mật khẩu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Số điện thoại *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Nhập SĐT"
                required
                disabled={isView}
              />
            </div>

            {!isView && (
              <div>
                <label className="text-sm text-gray-600">
                  Mật khẩu {isCreate ? "*" : "(bỏ trống nếu không đổi)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="passwordHash"
                    value={form.passwordHash}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded-lg w-full pr-10 focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder={
                      isCreate
                        ? "Nhập mật khẩu"
                        : "Nhập mật khẩu mới (nếu muốn đổi)"
                    }
                    required={isCreate}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Giới tính + Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                disabled={isView}
              >
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                disabled={isView}
              />
            </div>
          </div>

          {/* Vai trò + Trạng thái */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Vai trò</label>
              <select
                name="roleUser"
                value={form.roleUser}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400 outline-none"
                disabled={isView}
              >
                <option value="User">User</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange-500"
                  disabled={isView}
                />
                <span>Kích hoạt</span>
              </label>
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="text-sm text-gray-600">Ảnh đại diện</label>
            <div className="flex flex-col items-center gap-3 mt-2">
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <img
                      src={preview}
                      alt="avatar preview"
                      className="w-32 h-32 object-cover rounded-lg border hover:opacity-80 transition"
                    />
                  </label>

                  {!isView && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("fileUpload").click()
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Thay ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, avatarFile: null }));
                          setPreview(null);
                        }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !isView && (
                  <label
                    htmlFor="fileUpload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg text-gray-500 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Chọn ảnh từ thiết bị
                  </label>
                )
              )}
              <input
                id="fileUpload"
                type="file"
                name="avatarFile"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                disabled={isView}
              />
            </div>
          </div>

          {/* Nút hành động */}
          {!isView && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
              >
                {user ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UsersModal;

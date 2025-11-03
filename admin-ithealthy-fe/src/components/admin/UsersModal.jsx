import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { adminApi } from "../../api/adminApi";
import { toast } from "react-toastify";

const UsersModal = ({ isOpen, onClose, user, onSave }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    passwordHash: "",
    gender: "Male",
    dob: "",
    roleUser: "Customer",
    isActive: true,
    avatarFile: null,
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        passwordHash: "",
        gender: user.gender || "Male",
        dob: user.dob ? user.dob.split("T")[0] : "",
        roleUser: user.roleUser || "Customer",
        isActive: user.isActive ?? true,
        avatarFile: null,
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        passwordHash: "",
        gender: "Male",
        dob: "",
        roleUser: "Customer",
        isActive: true,
        avatarFile: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setForm({ ...form, [name]: checked });
    else if (type === "file") setForm({ ...form, avatarFile: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("FullName", form.fullName);
    formData.append("Email", form.email);
    formData.append("Phone", form.phone);
    if (form.passwordHash) formData.append("PasswordHash", form.passwordHash);
    formData.append("Gender", form.gender);
    if (form.dob) formData.append("DOB", form.dob); // yyyy-MM-dd
    formData.append("RoleUser", form.roleUser);
    formData.append("IsActive", form.isActive ? "true" : "false");
    if (form.avatarFile) formData.append("AvatarFile", form.avatarFile);

    let result;
    if (user) {
      result = await adminApi.updateCustomer(user.customerId, formData);
      toast.success("✅ Cập nhật người dùng thành công!");
    } else {
      result = await adminApi.createCustomer(formData);
      toast.success("✅ Thêm người dùng thành công!");
    }

    if (result) {
      onSave(result);
      onClose();
    }
  } catch (error) {
    console.error(error);
    const messages =
      error.response?.data?.messages ||
      (error.response?.data?.message ? [error.response.data.message] : ["Có lỗi xảy ra"]);
    messages.forEach((msg) => toast.error(msg));
  }
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <AiOutlineClose size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {user ? "Cập nhật Người dùng" : "Thêm Người dùng"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              name="fullName"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
              required
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
              required
            />
            {!user && (
              <input
                type="password"
                name="passwordHash"
                placeholder="Mật khẩu"
                value={form.passwordHash}
                onChange={handleChange}
                className="border p-2 rounded flex-1"
                required
              />
            )}
          </div>
          <div className="flex gap-2">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
            >
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="roleUser"
              value={form.roleUser}
              onChange={handleChange}
              className="border p-2 rounded flex-1"
            >
              <option value="Customer">Customer</option>
              <option value="Staff">Staff</option>
            </select>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Kích hoạt
            </label>
          </div>
          <div>
            <input
              type="file"
              name="avatarFile"
              accept="image/*"
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              {user ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersModal;

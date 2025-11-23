import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

const ProfileEditModal = ({ isOpen, onClose, user, onUpdated }) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    gender: "Male",
    dob: "",
    passwordHash: "",
    avatarFile: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob ? user.dob.split("T")[0] : "",
        passwordHash: "",
        avatarFile: null,
      });
      setPreview(user.avatar);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile") {
      const file = files[0];
      setForm({ ...form, avatarFile: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerId = user.customerId;

    const formData = new FormData();
    formData.append("FullName", form.fullName);
    formData.append("Phone", form.phone);
    formData.append("Gender", form.gender);
    formData.append("DOB", form.dob);
    formData.append("RoleUser", user.roleUser);
    formData.append("IsActive", user.isActive);
    formData.append("Email", user.email); // ❗ Không cho đổi Email

    if (form.passwordHash.trim() !== "") {
      formData.append("PasswordHash", form.passwordHash);
    }

    if (form.avatarFile) {
      formData.append("Avatar", form.avatarFile);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/customers/${customerId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Cập nhật thành công!");
      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.messages?.[0] || "Lỗi cập nhật!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cập nhật thông tin</h2>
          <button onClick={onClose}>
            <AiOutlineClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label>Họ tên</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* SĐT */}
          <div>
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Không cho sửa Email */}
          <div>
            <label>Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="border p-2 w-full rounded bg-gray-100"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label>Giới tính</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>

          {/* Ngày sinh */}
          <div>
            <label>Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label>Mật khẩu mới (nếu muốn đổi)</label>
            <input
              type="password"
              name="passwordHash"
              value={form.passwordHash}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Avatar */}
          <div>
            <label>Ảnh đại diện</label>
            <div className="flex items-center gap-4">
              <img
                src={preview}
                className="w-20 h-20 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                name="avatarFile"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-green-600 text-white py-3 rounded-lg">
            Cập nhật
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;

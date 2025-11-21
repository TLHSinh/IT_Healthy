import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId") || 1; // lấy từ local
    axios
      .get(`http://localhost:5000/api/customers/${customerId}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải thông tin user:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Đang tải thông tin...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Không tải được thông tin người dùng
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={user.avatar}
          alt="Avatar"
          className="w-28 h-28 rounded-full object-cover border"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Thay đổi ảnh
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <p className="font-semibold">Họ tên</p>
          <p className="border p-3 rounded-lg">{user.fullName}</p>
        </div>

        <div>
          <p className="font-semibold">Email</p>
          <p className="border p-3 rounded-lg">{user.email}</p>
        </div>

        <div>
          <p className="font-semibold">Số điện thoại</p>
          <p className="border p-3 rounded-lg">{user.phone}</p>
        </div>

        <div>
          <p className="font-semibold">Giới tính</p>
          <p className="border p-3 rounded-lg">
            {user.gender === "M" ? "Nam" : user.gender === "F" ? "Nữ" : "Khác"}
          </p>
        </div>

        <div>
          <p className="font-semibold">Ngày sinh</p>
          <p className="border p-3 rounded-lg">{user.dob}</p>
        </div>

        <div>
          <p className="font-semibold">Vai trò</p>
          <p className="border p-3 rounded-lg">{user.roleUser}</p>
        </div>
      </div>

      {/* Update Button */}
      <div className="mt-8">
        <button className="px-5 py-3 bg-green-600 text-white rounded-lg text-lg w-full">
          Cập nhật thông tin
        </button>
      </div>
    </div>
  );
};

export default Profile;

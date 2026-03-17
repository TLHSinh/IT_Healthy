import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { EyeIcon, EyeOff, Edit3 } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // chỉnh path nếu cần

// ========== MODAL CẬP NHẬT THÔNG TIN ==========
const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  customerId,
  onUpdated,
}) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    gender: "M",
    dob: "",
    newPassword: "",
    avatarFile: null,
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load dữ liệu profile vào form
  useEffect(() => {
    if (profile && isOpen) {
      setForm({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        gender:
          profile.gender === "F" ? "F" : profile.gender === "M" ? "M" : "M",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        newPassword: "",
        avatarFile: null,
      });
      setPreview(profile.avatar || null);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setForm((prev) => ({ ...prev, avatarFile: file || null }));
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.phone) {
      toast.error("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
      return;
    }

    if (!customerId) {
      toast.error("Không xác định được CustomerId từ AuthContext.");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      // Các field cho phép sửa
      fd.append("FullName", form.fullName);
      fd.append("Phone", form.phone);
      fd.append("Gender", form.gender);
      if (form.dob) fd.append("DOB", form.dob);

      // 🔥 PasswordHash: API yêu cầu BẮT BUỘC
      // - Nếu user nhập mật khẩu mới → gửi plaintext mới
      // - Nếu không → gửi lại hash cũ từ profile.passwordHash
      const passwordToSend =
        form.newPassword && form.newPassword.trim() !== ""
          ? form.newPassword
          : profile.passwordHash || "";

      fd.append("PasswordHash", passwordToSend);

      // Avatar (tùy chọn)
      if (form.avatarFile) {
        fd.append("Avatar", form.avatarFile);
      }

      // Các field KHÔNG cho sửa nhưng API vẫn đang gán:
      // customer.Email = request.Email;
      // customer.RoleUser = request.RoleUser;
      // customer.IsActive = request.IsActive;
      fd.append("Email", profile.email); // không cho đổi email
      fd.append("RoleUser", profile.roleUser); // không cho đổi role
      fd.append("IsActive", profile.isActive ? "true" : "false");

      const res = await axios.put(
        `http://localhost:5000/api/customers/${customerId}`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updated = res.data.data || res.data;
      toast.success("Cập nhật thông tin thành công!");
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      const msg =
        error.response?.data?.messages ||
        error.response?.data?.message ||
        "Đã xảy ra lỗi khi cập nhật!";
      toast.error(Array.isArray(msg) ? msg.join("\n") : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl relative shadow-2xl border border-gray-200 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <Edit3 size={20} /> Cập nhật thông tin cá nhân
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <AiOutlineClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên + Email (email khóa) */}
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
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Email (không thể thay đổi)
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
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
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Mật khẩu (bỏ trống nếu không đổi)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-lg w-full pr-10 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Nhập mật khẩu mới"
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
              />
            </div>
          </div>

          {/* Vai trò + Trạng thái (chỉ hiển thị) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">
                Vai trò (không thể thay đổi)
              </label>
              <input
                type="text"
                value={profile.roleUser}
                disabled
                className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Trạng thái</label>
              <input
                type="text"
                value={profile.isActive ? "Đang hoạt động" : "Đã khóa"}
                disabled
                className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="text-sm text-gray-600">Ảnh đại diện</label>
            <div className="flex flex-col items-center gap-3 mt-2">
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="fileUploadProfile" className="cursor-pointer">
                    <img
                      src={preview}
                      alt="avatar preview"
                      className="w-32 h-32 object-cover rounded-lg border hover:opacity-80 transition"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("fileUploadProfile").click()
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Thay ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, avatarFile: null }));
                        setPreview(profile.avatar || null);
                      }}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Hoàn tác
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="fileUploadProfile"
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
              )}
              <input
                id="fileUploadProfile"
                type="file"
                name="avatarFile"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Nút hành động */}
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
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========== TRANG PROFILE ==========
const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // customerId lấy từ AuthContext
  const customerId = authUser?.customerId;

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/customers/${customerId}`)
      .then((res) => {
        // nếu API trả { data: customer } thì đổi thành res.data.data
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải thông tin user:", err);
        setLoading(false);
      });
  }, [customerId]);

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Bạn cần đăng nhập để xem thông tin cá nhân.
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Đang tải thông tin...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Không tải được thông tin người dùng
      </div>
    );

return (
  <>
    <div >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>
        <p className="text-sm text-gray-500">
          Quản lý thông tin cá nhân & bảo mật
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {/* Top */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 border-b">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border shadow"
          />

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>

            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600">
                {profile.roleUser}
              </span>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  profile.isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {profile.isActive ? "Đang hoạt động" : "Đã khóa"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <Edit3 size={16} />
            Chỉnh sửa
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {[
            ["Họ tên", profile.fullName],
            ["Email", profile.email],
            ["Số điện thoại", profile.phone],
            [
              "Giới tính",
              profile.gender === "M"
                ? "Nam"
                : profile.gender === "F"
                ? "Nữ"
                : "Khác",
            ],
            ["Ngày sinh", profile.dob?.slice(0, 10) || "—"],
            [
              "Trạng thái",
              profile.isActive ? "Đang hoạt động" : "Đã khóa",
            ],
          ].map(([label, value], i) => (
            <div key={i}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <div className="bg-gray-50 border rounded-xl px-4 py-3 text-gray-800">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow"
          >
            Cập nhật thông tin
          </button>
        </div>
      </div>
    </div>

    {/* Modal */}
    <EditProfileModal
      isOpen={isEditOpen}
      onClose={() => setIsEditOpen(false)}
      profile={profile}
      customerId={customerId}
      onUpdated={(u) => setProfile(u)}
    />
  </>
);

};

export default Profile;

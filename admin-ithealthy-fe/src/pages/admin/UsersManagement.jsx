import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import UsersModal from "../../components/admin/UsersModal";
import { AiOutlinePlus } from "react-icons/ai";
import { Search, User } from "lucide-react";
import { toast } from "react-toastify";
import { Eye, Edit2, Trash2 } from "lucide-react";

const PAGE_SIZE = 5;

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view

  // ✅ Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCustomers();
      setUsers(res.data || res);
    } catch (error) {
      console.error(error);
      toast.error("Lấy danh sách người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Thêm người dùng
  const handleAdd = () => {
    setSelectedUser(null);
    setIsViewMode(false);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // ✅ Sửa người dùng
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsViewMode(false);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // ✅ Xem thông tin người dùng
  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewMode(true);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // ✅ Xóa người dùng
  const handleDeleteConfirm = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?`))
      return;
    try {
      await adminApi.deleteCustomer(user.customerId);
      toast.success("Xóa người dùng thành công!");
      setUsers((prev) => prev.filter((u) => u.customerId !== user.customerId));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Không thể xóa người dùng");
    }
  };

  // ✅ Cập nhật danh sách sau khi thêm / sửa
  const handleSave = (user) => {
    if (!user) return;
    setUsers((prev) => {
      const exists = prev.find((u) => u.customerId === user.customerId);
      if (exists) {
        return prev.map((u) =>
          u.customerId === user.customerId ? { ...u, ...user } : u
        );
      }
      return [user, ...prev];
    });
  };

  // ✅ Lọc và tìm kiếm
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    const matchStatus =
      !filterStatus ||
      (filterStatus === "active" && u.isActive) ||
      (filterStatus === "inactive" && !u.isActive);
    return matchSearch && matchStatus;
  });

  // ✅ Tính phân trang
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const currentData = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div>
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
          <User className="text-indigo-600" /> Quản lý Người dùng
        </h2>

        <div className="flex items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="flex items-center border border-gray-300 rounded-xl shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200 transition">
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 w-64 outline-none text-sm"
              placeholder="Tìm theo tên, email, SĐT..."
            />
            <div className="px-3 text-gray-500 border-l bg-gray-50">
              <Search size={18} />
            </div>
          </div>

          {/* Lọc trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-400 transition"
          >
            <option value="">Tất cả</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Khóa</option>
          </select>

          {/* Nút thêm */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
          >
            <AiOutlinePlus /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* --- Danh sách người dùng --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">STT</th>
              <th className="px-4 py-3 font-semibold">Avatar</th>
              <th className="px-4 py-3 font-semibold">Họ tên</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">SĐT</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Không có người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              currentData.map((user, index) => (
                <tr
                  key={user.customerId}
                  className="border-t hover:bg-indigo-50/30 transition"
                >
                  <td className="px-4 py-3">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        ?
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.fullName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">{user.roleUser || "User"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Kích hoạt" : "Khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handleView(user)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(user)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Phân trang --- */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <div className="text-gray-600">
            Hiển thị {Math.min(page * PAGE_SIZE, filteredUsers.length)} /{" "}
            {filteredUsers.length} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              ← Trước
            </button>
            <span className="px-2">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* --- Modal thêm/sửa/xem --- */}
      {isModalOpen && (
        <UsersModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSave={handleSave}
          isView={modalMode === "view"}
          isCreate={modalMode === "create"}
        />
      )}
    </div>
  );
};

export default UsersManagement;

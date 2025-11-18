// src/pages/admin/UsersManagement.jsx
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import UsersModal from "../../components/admin/UsersModal";
import ConfirmDialog from "../../components/common/ConfirmDialog"; // ✅ import ConfirmDialog
import { Search, User, Eye, Edit2, Trash2, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

const PAGE_SIZE = 5;

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

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

  // ✅ Mở modal thêm mới
  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // ✅ Mở modal sửa
  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // ✅ Mở modal xem chi tiết
  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // ✅ Mở ConfirmDialog
  const handleDeleteClick = (user) => {
    setToDelete(user);
    setConfirmOpen(true);
  };

  // ✅ Thực sự xóa khi xác nhận
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeletingId(toDelete.customerId);
    setConfirmOpen(false);
    try {
      await adminApi.deleteCustomer(toDelete.customerId);
      toast.success("Xóa người dùng thành công!");
      setUsers((prev) =>
        prev.filter((u) => u.customerId !== toDelete.customerId)
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Không thể xóa người dùng");
    } finally {
      setDeletingId(null);
      setToDelete(null);
    }
  };

  // ✅ Gọi lại danh sách sau khi thêm/sửa
  const handleSave = async () => {
    await fetchUsers();
  };

  // ✅ Lọc + tìm kiếm
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

  // ✅ Phân trang
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const currentData = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-6">
      {/* --- Header --- */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 md:gap-0">
  {/* Tiêu đề */}
  <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
    <User className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
    Quản lý Người dùng
  </h2>

  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3 w-full sm:w-auto">
    {/* Ô tìm kiếm */}
    <div className="flex items-center w-full sm:w-72 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
      <input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
        className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        placeholder="Tìm theo tên, email, SĐT..."
      />
      <div className="px-3 text-gray-400 border-l border-gray-200">
        <Search size={20} />
      </div>
    </div>

    {/* Lọc trạng thái */}
    <select
      value={filterStatus}
      onChange={(e) => {
        setFilterStatus(e.target.value);
        setPage(1);
      }}
      className="w-full sm:w-auto p-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
    >
      <option value="">Tất cả</option>
      <option value="active">Kích hoạt</option>
      <option value="inactive">Khóa</option>
    </select>

    {/* Nút thêm */}
    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition w-full sm:w-auto"
    >
      <PlusCircle className="w-5 h-5" />
      Thêm người dùng
    </button>
  </div>
</div>


      {/* --- Danh sách người dùng --- */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
          </div>
        )}

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
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className={`p-2 rounded-lg hover:bg-red-50 text-red-600 ${
                          deletingId === user.customerId
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={deletingId === user.customerId}
                        title="Xóa"
                      >
                        <Trash2 size={18} />
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
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
          {/* Thông tin bản ghi */}
          <div className="text-gray-600 font-medium">
            Hiển thị{" "}
            <span className="text-indigo-600 font-bold">
              {Math.min(page * PAGE_SIZE, filteredUsers.length)}
            </span>{" "}
            / {filteredUsers.length} bản ghi
          </div>

          {/* Nút phân trang */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút Đầu */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              « Đầu
            </button>

            {/* Nút Trước */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {/* Hiển thị Trang hiện tại */}
            <span className="px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm">
              {page} / {totalPages}
            </span>

            {/* Nút Sau */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau →
            </button>

            {/* Nút Cuối */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cuối »
            </button>
          </div>
        </div>
      )}

      {/* --- Modal Thêm/Sửa/Xem --- */}
      {isModalOpen && (
        <UsersModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSave={handleSave}
          isCreate={modalMode === "create"}
          isView={modalMode === "view"}
        />
      )}

      {/* --- ConfirmDialog Xóa --- */}
      {confirmOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa Người dùng "${toDelete?.fullName}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default UsersManagement;

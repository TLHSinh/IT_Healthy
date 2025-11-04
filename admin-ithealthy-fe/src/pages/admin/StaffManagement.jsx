import React, { useEffect, useState, useMemo } from "react";
import { adminApi } from "../../api/adminApi";
import { User, Search, PlusCircle, Trash2, Edit2, Eye } from "lucide-react";
import StaffModal from "../../components/admin/StaffModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Toaster, toast } from "react-hot-toast";

const PAGE_SIZE = 8;

const StaffManagement = () => {
  const [staffs, setStaffs] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    fetchStaffs();
    fetchStores();
  }, []);

  const fetchStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getStaffs();
      setStaffs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi lấy danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await adminApi.getStores();
      setStores(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách cửa hàng:", err);
    }
  };

  const getStoreName = (storeId) =>
    stores.find((store) => store.storeId === storeId)?.storeName || "-";

  const filtered = useMemo(() => {
    let list = staffs;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.phone && s.phone.toLowerCase().includes(q)) ||
          getStoreName(s.storeId).toLowerCase().includes(q)
      );
    }
    if (roleFilter) {
      list = list.filter(
        (s) =>
          String(s.roleStaff || s.role || "").toLowerCase() ===
          roleFilter.toLowerCase()
      );
    }
    if (statusFilter) {
      const map = { active: true, inactive: false };
      list = list.filter((s) => Boolean(s.isActive) === map[statusFilter]);
    }
    return list;
  }, [staffs, query, roleFilter, statusFilter, stores]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // --- Modal handlers ---
  const handleView = (staff) => {
    setSelected(staff);
    setIsCreateMode(false);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEdit = (staff) => {
    setSelected(staff);
    setIsCreateMode(false);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setIsCreateMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (staff) => {
    setToDelete(staff);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminApi.deleteStaff(toDelete.staffId);
      toast.success(`Xóa nhân viên "${toDelete.fullName}" thành công!`);
      setConfirmOpen(false);
      setToDelete(null);
      fetchStaffs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleSave = async (payload, isNew) => {
  try {
    const formatted = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      roleStaff: payload.roleStaff,
      isActive: payload.isActive ?? true,
      hireDate: payload.hireDate || new Date().toISOString(),
      storeId: payload.storeId,
      PasswordHash: payload.password || "",
    };

    if (isNew) {
      await adminApi.createStaff(formatted);
      toast.success("Tạo nhân viên thành công!");
    } else {
      await adminApi.updateStaff(payload.staffId, formatted);
      toast.success("Cập nhật nhân viên thành công!");
    }

    setIsModalOpen(false);
    fetchStaffs();

    return { success: true }; // trả về thành công
  } catch (err) {
    const messages =
      err.response?.data?.messages?.length
        ? err.response.data.messages
        : err.response?.data?.message
        ? [err.response.data.message]
        : ["Lưu thất bại"];

    messages.forEach((msg) => toast.error(msg));

    return { success: false, errors: messages }; // trả về lỗi, KHÔNG throw nữa
  }
};


  return (
    <div >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
          <User className="text-indigo-600" /> Quản lý nhân viên
        </h2>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="flex items-center border border-gray-300 rounded-xl shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200 transition">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 w-64 outline-none text-sm"
              placeholder="Tìm theo tên, email, SĐT, cửa hàng..."
            />
            <div className="px-3 text-gray-500 border-l bg-gray-50">
              <Search size={18} />
            </div>
          </div>

          {/* Filters */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-400 transition"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-400 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang làm</option>
            <option value="inactive">Ngừng</option>
          </select>

          {/* Add button */}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
          >
            <PlusCircle size={18} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              {[
                "#",
                "Họ tên",
                "Email",
                "Số điện thoại",
                "Cửa hàng",
                "Vai trò",
                "Trạng thái",
                "Ngày vào",
                "Thao tác",
              ].map((title) => (
                <th key={title} className="px-4 py-3 font-semibold">
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              pageData.map((s, idx) => (
                <tr
                  key={s.staffId}
                  className="border-t hover:bg-indigo-50/30 transition"
                >
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{getStoreName(s.storeId)}</td>
                  <td className="px-4 py-3 capitalize">{s.roleStaff || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isActive ? "Đang làm" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.hireDate
                      ? new Date(s.hireDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(s)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(s)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-sm">
        <div className="text-gray-600">
          Hiển thị {Math.min(filtered.length, page * PAGE_SIZE)} /{" "}
          {filtered.length} bản ghi
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

      {/* Modals */}
      {isModalOpen && (
        <StaffModal
          staff={selected}
          isCreate={isCreateMode}
          stores={stores}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isView={isViewMode}
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa nhân viên "${toDelete?.fullName}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StaffManagement;

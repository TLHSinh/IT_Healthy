// StaffManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle, EyeIcon, Trash2, Users, Edit2, Search } from "lucide-react";
import StaffModal from "../../components/admin/StaffModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8; // giống UsersManagement

const StaffManagement = () => {
  const [staffs, setStaffs] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [isView, setIsView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- ConfirmDialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // --- Pagination
  const [page, setPage] = useState(1);

  // --- Search & Filter
  const [searchText, setSearchText] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "active" / "inactive"

  const API_BASE = "http://localhost:5000/api";

  // 🔹 Fetch danh sách nhân viên
  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/staffs`);
      setStaffs(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân viên");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch danh sách cửa hàng
  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores`);
      setStores(res.data.data || res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách cửa hàng");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchStores();
  }, []);

  // 🔹 Lưu dữ liệu (tạo mới hoặc cập nhật)
  const handleSave = async (formData, createMode) => {
    try {
      if (createMode) {
        await axios.post(`${API_BASE}/staffs`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm nhân viên thành công!");
      } else {
        await axios.put(`${API_BASE}/staffs/${selectedStaff.staffId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật nhân viên thành công!");
      }
      closeModal();
      fetchStaffs();
    } catch (err) {
      toast.error(err.response?.data?.messages?.[0] || "Lưu thất bại");
      console.error(err);
    }
  };

  // 🔹 Xóa nhân viên
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeletingId(toDelete.staffId);
    setConfirmOpen(false);
    try {
      await axios.delete(`${API_BASE}/staffs/${toDelete.staffId}`);
      toast.success("Đã xóa nhân viên");
      setStaffs(prev => prev.filter(s => s.staffId !== toDelete.staffId));
    } catch (err) {
      toast.error("Xóa thất bại");
      console.error(err);
    } finally {
      setDeletingId(null);
      setToDelete(null);
    }
  };

  // 🔹 Mở modal
  const openModal = (mode, staff = null) => {
    const freshStaff = staff ? staffs.find(s => s.staffId === staff.staffId) || staff : null;
    setSelectedStaff(freshStaff);
    setIsCreate(mode === "create");
    setIsView(mode === "view");
    setModalOpen(true);
  };

  // 🔹 Đóng modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedStaff(null);
    setIsCreate(false);
    setIsView(false);
  };

  // 🔹 Lọc & tìm kiếm
  const filteredStaffs = staffs.filter(s => {
  const matchSearch = s.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                      s.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                      s.phone?.includes(searchText);
  const matchStore = filterStore ? s.storeId === Number(filterStore) : true;
  const matchRole = filterRole ? s.roleStaff === filterRole : true;
  const matchStatus = filterStatus
    ? filterStatus === "active" ? s.isActive : !s.isActive
    : true;
  return matchSearch && matchStore && matchRole && matchStatus;
});


  const totalPages = Math.ceil(filteredStaffs.length / PAGE_SIZE);
  const currentData = filteredStaffs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset page khi filter/search thay đổi
  useEffect(() => {
    setPage(1);
  }, [searchText, filterStore, filterRole, filterStatus]);

  return (
    <div className="p-6" >
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        {/* Tiêu đề */}
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
          <Users className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          Quản lý Nhân viên
        </h2>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="flex items-center w-full sm:w-72 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <input
              type="text"
              placeholder="Tìm theo tên, email, điện thoại..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <div className="px-3 text-gray-400 border-l border-gray-200">
              <Search size={20} />
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={filterStore}
              onChange={e => setFilterStore(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
            >
              <option value="">Tất cả cửa hàng</option>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
              ))}
            </select>

            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
            >
              <option value="">Tất cả vai trò</option>
              {Array.from(new Set(staffs.map(s => s.roleStaff))).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang làm</option>
              <option value="inactive">Nghỉ việc</option>
            </select>

            {/* Nút thêm nhân viên */}
            <button
              onClick={() => openModal("create")}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition w-full sm:w-auto"
            >
              <PlusCircle className="w-5 h-5" />
              Thêm nhân viên
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
          </div>
        )}
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-left">
              <th className="p-3 border-b">STT</th>
              <th className="p-3 border-b">Họ tên</th>
              <th className="p-3 border-b">Ảnh</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Giới tính</th>
              <th className="p-3 border-b">Điện thoại</th>
              <th className="p-3 border-b">Cửa hàng</th>
              <th className="p-3 border-b">Vai trò</th>
              <th className="p-3 border-b">Ngày vào làm</th>
              <th className="p-3 border-b text-center">Trạng thái</th>
              <th className="p-3 border-b text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-5 text-gray-500">Không có nhân viên nào</td>
              </tr>
            ) : (
              currentData.map((s, idx) => (
                <tr key={s.staffId} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b">{(page-1)*PAGE_SIZE + idx + 1}</td>
                  <td className="p-3 border-b">{s.fullName}</td>
                  <td className="p-3 border-b">
                    {s.avatar ? (
                      <img src={s.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border"/>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-400">+</div>
                    )}
                  </td>
                  <td className="p-3 border-b">{s.email}</td>
                  <td className="p-3 border-b">{s.gender === "M" ? "Nam" : s.gender === "F" ? "Nữ" : "-"}</td>
                  <td className="p-3 border-b">{s.phone}</td>
                  <td className="p-3 border-b">{s.storeName || "—"}</td>
                  <td className="p-3 border-b capitalize">{s.roleStaff}</td>
                  <td className="p-3 border-b">{s.hireDate ? new Date(s.hireDate).toLocaleDateString("vi-VN") : "—"}</td>
                  <td className="p-3 border-b text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {s.isActive ? "Đang làm" : "Nghỉ việc"}
                    </span>
                  </td>
                  <td className="p-3 border-b text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openModal("view", s)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800" title="Xem">
                        <EyeIcon size={18} />
                      </button>
                      <button onClick={() => openModal("edit", s)} className="p-2 rounded-lg text-yellow-600 hover:bg-green-50 hover:text-green-800" title="Sửa">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => { setToDelete(s); setConfirmOpen(true); }} className={`p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 ${deletingId === s.staffId ? "opacity-50 cursor-not-allowed" : ""}`} disabled={deletingId === s.staffId} title="Xóa">
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

      {/* Pagination */}
      {!loading && filteredStaffs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(page * PAGE_SIZE, filteredStaffs.length)}</span> / {filteredStaffs.length} bản ghi
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">« Đầu</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">← Trước</button>
            <span className="px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Sau →</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Cuối »</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <StaffModal
          staff={selectedStaff}
          isCreate={isCreate}
          isView={isView}
          stores={stores}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ConfirmDialog */}
      {confirmOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa Nhân Viên "${toDelete?.fullName}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StaffManagement;

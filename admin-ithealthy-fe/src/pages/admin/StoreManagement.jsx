import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import {
  Store,
  PlusCircle,
  Trash2,
  Edit2,
  RefreshCcw,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import StoreModal from "../../components/admin/StoreModal";

const PAGE_SIZE = 8;

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [page, setPage] = useState(1);

  // 🔹 Lấy danh sách cửa hàng
  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStores();
      // nếu API trả về mảng thì res.data là mảng, còn nếu axios trả trực tiếp mảng thì dùng res
      const data = res.data || res;
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách:", err);
      toast.error("Không thể tải danh sách cửa hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // 🔹 Thêm mới
  const handleAddNew = () => {
    setCurrentStore(null);
    setModalOpen(true);
  };

  // 🔹 Sửa
  const handleEdit = (store) => {
    setCurrentStore(store);
    setModalOpen(true);
  };

  // 🔹 Xóa
  const handleDelete = async (store) => {
    const id = store.storeId || store.StoreId;
    if (!id) {
      toast.error("Không xác định được ID cửa hàng!");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa cửa hàng "${store.storeName}" không?`
    );
    if (!confirmDelete) return;

    try {
      const result = await adminApi.deleteStore(id);
      if (result) {
        toast.success("🗑️ Đã xóa cửa hàng thành công!");
        await fetchStores();
      }
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      toast.error("Không thể xóa cửa hàng!");
    }
  };

  // --- Xử lý phân trang ---
  const totalPages = Math.ceil(stores.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = stores.slice(startIndex, endIndex);

  return (
    <div >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Store className="text-indigo-600" /> Quản lý cửa hàng
        </h2>

        <div className="flex gap-2">
          <button
            onClick={fetchStores}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <RefreshCcw size={16} /> Làm mới
          </button>
          <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
            onClick={handleAddNew}
          >
            <PlusCircle size={18} /> Thêm cửa hàng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              {[
                "#",
                "Tên cửa hàng",
                "Địa chỉ",
                "Điện thoại",
                "Thành phố",
                "Quận/Huyện",
                "Ngày tham gia",
                "Đánh giá",
                "Trạng thái",
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
                <td colSpan="10" className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-6 text-center text-gray-500">
                  Không có cửa hàng nào.
                </td>
              </tr>
            ) : (
              currentPageData.map((store, index) => (
                <tr
                  key={store.storeId || store.StoreId}
                  className="border-t hover:bg-indigo-50/30 transition"
                >
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3">{store.storeName}</td>
                  <td className="px-4 py-3 truncate max-w-xs">
                    {`${store.streetAddress || ""}, ${store.ward || ""}, ${store.district || ""}`}
                  </td>
                  <td className="px-4 py-3">{store.phone}</td>
                  <td className="px-4 py-3">{store.city}</td>
                  <td className="px-4 py-3">{store.district}</td>
                  <td className="px-4 py-3">
                    {store.dateJoined
                      ? new Date(store.dateJoined).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {store.rating ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {store.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(store)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(store)}
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
      {!loading && stores.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm flex-wrap gap-3">
          <div className="text-gray-600">
            Hiển thị{" "}
            <strong>{Math.min(stores.length, page * PAGE_SIZE)}</strong> /{" "}
            {stores.length} bản ghi
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

      {/* Modal */}
      {modalOpen && (
        <StoreModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          store={currentStore}
          refreshList={fetchStores}
        />
      )}
    </div>
  );
};

export default StoreManagement;

// src/pages/admin/StoreManagement.jsx
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { Store, PlusCircle, Trash2, Edit2, RefreshCcw, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import StoreModal from "../../components/admin/StoreModal";
import StoreInventoryModal from "../../components/admin/StoreInventoryModal";
import StoreProductsModal from "../../components/admin/StoreProductsModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { FiPackage } from "react-icons/fi"; // FiPackage = icon kho
import { BiBox } from "react-icons/bi"; // BiBox = icon kho 2

const PAGE_SIZE = 8;

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryStore, setInventoryStore] = useState(null);

  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [productsStore, setProductsStore] = useState(null);

  // 🔹 Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔹 Lấy danh sách cửa hàng
  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStores();
      const data = res.data || res;
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách cửa hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAddNew = () => {
    setCurrentStore(null);
    setModalOpen(true);
  };

  const handleEdit = (store) => {
    setCurrentStore(store);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;
    const id = storeToDelete.storeId || storeToDelete.StoreId;

    try {
      await adminApi.deleteStore(id);
      toast.success("Đã xóa cửa hàng thành công!");
      setStores((prev) => prev.filter((s) => (s.storeId || s.StoreId) !== id));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      if (msg.toLowerCase().includes("nhân viên") || msg.toLowerCase().includes("employee")) {
        toast.error("Không thể xóa cửa hàng vì vẫn còn nhân viên thuộc biên chế!");
      } else {
        toast.error(msg);
      }
    } finally {
      setConfirmOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleViewInventory = (store) => {
    setInventoryStore(store);
    setInventoryModalOpen(true);
  };

  const handleViewProducts = (store) => {
    setProductsStore(store);
    setProductsModalOpen(true);
  };

  // 🔹 Filtered data
  const filteredStores = stores
    .filter((s) =>
      s.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((s) =>
      statusFilter === ""
        ? true
        : statusFilter === "active"
        ? s.isActive
        : !s.isActive
    );

  const totalPages = Math.ceil(filteredStores.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredStores.slice(startIndex, endIndex);

  return (
    <div className="p-6" >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Main content */}
      <div >
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
          {/* Tiêu đề */}
          <h2 className="flex items-center gap-3 text-3xl font-extrabold text-blue-600">
            <Store className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            Quản lý Cửa hàng
          </h2>

          {/* Search, Filter & Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center w-full md:w-auto">
            {/* Search */}
            <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <input
                type="text"
                placeholder="Tìm kiếm cửa hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <div className="px-3 text-gray-400 border-l border-gray-200">
                <Search size={20} />
              </div>
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition w-full sm:w-auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>

            {/* Buttons */}
            <button
              onClick={fetchStores}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium w-full sm:w-auto"
            >
              <RefreshCcw className="w-4 h-4" /> Làm mới
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition w-full sm:w-auto"
            >
              <PlusCircle className="w-5 h-5" /> Thêm cửa hàng
            </button>
          </div>
        </div>


        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-blue-600 text-left">
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
                    <td className="px-4 py-3 text-gray-700 font-medium">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">{store.storeName}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{`${store.streetAddress || ""}, ${store.ward || ""}, ${store.district || ""}`}</td>
                    <td className="px-4 py-3">{store.phone}</td>
                    <td className="px-4 py-3">{store.city}</td>
                    <td className="px-4 py-3">{store.district}</td>
                    <td className="px-4 py-3">{store.dateJoined ? new Date(store.dateJoined).toLocaleDateString("vi-VN") : "-"}</td>
                    <td className="px-4 py-3 text-center">{store.rating ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                          onClick={() => {
                            setStoreToDelete(store);
                            setConfirmOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleViewInventory(store)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="Xem tồn kho"
                        >
                          <FiPackage size={16} />
                        </button>

                        <button
                          onClick={() => handleViewProducts(store)}
                          className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
                          title="Xem sản phẩm"
                        >
                          <BiBox size={16} />
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
        {!loading && filteredStores.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
            {/* Thông tin bản ghi */}
            <div className="text-gray-600 font-medium">
              Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredStores.length, page * PAGE_SIZE)}</span> / {filteredStores.length} bản ghi
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



        {/* Confirm delete */}
        {confirmOpen && storeToDelete && (
          <ConfirmDialog
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa cửa hàng "${storeToDelete.storeName}"?`}
            onCancel={() => {
              setConfirmOpen(false);
              setStoreToDelete(null);
            }}
            onConfirm={handleDelete}
          />
        )}

        {/* Modal thêm/sửa cửa hàng */}
        {modalOpen && (
          <StoreModal
            isOpen={modalOpen}
            setIsOpen={setModalOpen}
            store={currentStore}
            refreshList={fetchStores}
          />
        )}

        {/* Modal tồn kho */}
        {inventoryModalOpen && inventoryStore && (
          <StoreInventoryModal
            isOpen={inventoryModalOpen}
            setIsOpen={setInventoryModalOpen}
            storeId={inventoryStore.storeId}
            storeName={inventoryStore.storeName}
          />
        )}

        {/* Modal sản phẩm */}
        {productsModalOpen && productsStore && (
          <StoreProductsModal
            isOpen={productsModalOpen}
            setIsOpen={setProductsModalOpen}
            storeId={productsStore.storeId}
            storeName={productsStore.storeName}
          />
        )}
      </div>

      {/* Footer giải thích icon cố định dưới cùng */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100 flex flex-wrap gap-4 text-sm text-gray-700 shadow-md">
        <div className="flex items-center gap-2">
          <Edit2 size={16} className="text-yellow-600" />
          <span>Sửa cửa hàng</span>
        </div>
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-red-600" />
          <span>Xóa cửa hàng</span>
        </div>
        <div className="flex items-center gap-2">
          <FiPackage size={16} className="text-blue-600" />
          <span>Xem tồn kho</span>
        </div>
        <div className="flex items-center gap-2">
          <BiBox size={16} className="text-purple-600" />
          <span>Xem sản phẩm</span>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;

// pages/admin/VouchersManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { PlusCircle, Edit2, Trash2, RefreshCcw, Ticket } from "lucide-react";
import VouchersModal from "../../components/admin/VouchersModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8;

const VouchersManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVoucher, setModalVoucher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // 🔹 Lấy dữ liệu dropdown (cửa hàng, sản phẩm, danh mục)
  const fetchOptions = async () => {
    try {
      const [storesRes, productsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stores"),
        axios.get("http://localhost:5000/api/products/all-products"),
        axios.get("http://localhost:5000/api/category/category_pro")
      ]);

      setStores(storesRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lấy dữ liệu dropdown thất bại");
    }
  };

  // 🔹 Lấy danh sách voucher
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/vouchers");
      setVouchers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lấy danh sách voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xóa voucher
  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/vouchers/${toDelete.voucherId}`);
      toast.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (err) {
      console.error(err);
      toast.error("Xóa voucher thất bại");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchVouchers();
  }, []);

  // 🔹 Map IDs sang tên hiển thị
  const getNamesByIds = (ids, list, key = "name") => {
    if (!ids || ids.length === 0) return "-";
    return ids
      .map(id => {
        const item = list.find(i => i[`${key}Id`] === id);
        return item ? item[`${key}Name`] : id;
      })
      .join(", ");
  };

  // 🔍 Lọc theo code hoặc mô tả
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v =>
      v.code?.toLowerCase().includes(search.toLowerCase()) ||
      v.descriptionVou?.toLowerCase().includes(search.toLowerCase())
    );
  }, [vouchers, search]);

  // 🔹 Phân trang
  const totalPages = Math.ceil(filteredVouchers.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredVouchers.slice(startIndex, endIndex);

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Ticket className="text-indigo-600" /> Quản lý Voucher
        </h2>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm theo code hoặc mô tả..."
            className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={fetchVouchers}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <RefreshCcw size={16} /> Làm mới
          </button>

          <button
            onClick={() => { setModalVoucher(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
          >
            <PlusCircle size={18} /> Tạo Voucher
          </button>
        </div>
      </div>

      {/* Bảng voucher */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">STT</th>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Mô tả</th>
              <th className="px-4 py-3 font-semibold">Loại giảm</th>
              <th className="px-4 py-3 font-semibold">Giá trị</th>
              <th className="px-4 py-3 font-semibold">Đơn tối thiểu</th>
              <th className="px-4 py-3 font-semibold">Max giảm</th>
              <th className="px-4 py-3 font-semibold">Ngày bắt đầu</th>
              <th className="px-4 py-3 font-semibold">Ngày kết thúc</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Cửa hàng</th>
              <th className="px-4 py-3 font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Danh mục</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="14" className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="14" className="p-6 text-center text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              currentPageData.map((v, index) => (
                <tr key={v.voucherId} className="border-t hover:bg-indigo-50/30 transition">
                  <td className="px-4 py-3 text-gray-700 font-medium">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{v.code}</td>
                  <td className="px-4 py-3">{v.descriptionVou}</td>
                  <td className="px-4 py-3">{v.discountType}</td>
                  <td className="px-4 py-3">{v.discountValue}</td>
                  <td className="px-4 py-3">{v.minOrderAmount}</td>
                  <td className="px-4 py-3">{v.maxDiscountAmount}</td>
                  <td className="px-4 py-3">{v.startDate}</td>
                  <td className="px-4 py-3">{v.expiryDate}</td>
                  <td className="px-4 py-3">{v.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{getNamesByIds(v.storeIDs, stores, "store")}</td>
                  <td className="px-4 py-3">{getNamesByIds(v.productIDs, products, "product")}</td>
                  <td className="px-4 py-3">{getNamesByIds(v.categoryIDs, categories, "category")}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setModalVoucher(v); setShowModal(true); }}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => { setToDelete(v); setConfirmOpen(true); }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
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

      {/* Phân trang */}
      {!loading && filteredVouchers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredVouchers.length, page * PAGE_SIZE)}</span> / {filteredVouchers.length} bản ghi
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              « Đầu
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            <span className="px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
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

      {/* Modal */}
      {showModal && (
        <VouchersModal
          voucher={modalVoucher}
          onClose={() => setShowModal(false)}
          onSaved={fetchVouchers}
          stores={stores}
          products={products}
          categories={categories}
        />
      )}

      {/* Xác nhận xóa */}
      {confirmOpen && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa Voucher "${toDelete?.code}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default VouchersManagement;

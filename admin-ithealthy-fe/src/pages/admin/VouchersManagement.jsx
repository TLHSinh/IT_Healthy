// src/pages/admin/VouchersManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, RefreshCcw, TicketPercent, Search } from "lucide-react";
import VouchersModal from "../../components/admin/VouchersModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8;

const VouchersManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Dữ liệu phụ
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter
  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination
  const [page, setPage] = useState(1);

  const API_BASE = "http://localhost:5000/api";

  // 🔹 Fetch dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, p, c, v] = await Promise.all([
        axios.get(`${API_BASE}/Stores`),
        axios.get(`${API_BASE}/Products/all-products`),
        axios.get(`${API_BASE}/Category/category_pro`),
        axios.get(`${API_BASE}/vouchers`)
      ]);
      setStores(s.data);
      setProducts(p.data);
      setCategories(c.data);

      const detailedVouchers = await Promise.all(
        v.data.map(async (voucher) => {
          const detail = await axios.get(`${API_BASE}/vouchers/${voucher.voucherId}`);
          return detail.data;
        })
      );
      setVouchers(detailedVouchers);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Add / Edit
  const openModal = (voucher = null) => {
    setEditData(voucher);
    setModalOpen(true);
  };

  const refreshVoucher = async (updated) => {
    try {
      const res = await axios.get(`${API_BASE}/vouchers/${updated.voucherId}`);
      setVouchers((prev) => {
        const exists = prev.find((v) => v.voucherId === res.data.voucherId);
        return exists
          ? prev.map((v) => (v.voucherId === res.data.voucherId ? res.data : v))
          : [...prev, res.data];
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/vouchers/${id}`);
      toast.success("Xóa voucher thành công!");
      setVouchers((prev) => prev.filter((v) => v.voucherId !== id));
    } catch (err) {
      toast.error("Xóa voucher thất bại!");
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  // 🔹 Filtered vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const storeMatch = storeFilter
      ? v.stores?.some((s) => s.storeName.toLowerCase().includes(storeFilter.toLowerCase()))
      : true;
    const productMatch = productFilter
      ? v.products?.some((p) => p.productName.toLowerCase().includes(productFilter.toLowerCase()))
      : true;
    const categoryMatch = categoryFilter
      ? v.categories?.some((c) => c.categoryName.toLowerCase().includes(categoryFilter.toLowerCase()))
      : true;
    return storeMatch && productMatch && categoryMatch;
  });

  const totalPages = Math.ceil(filteredVouchers.length / PAGE_SIZE);
  const currentData = filteredVouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [storeFilter, productFilter, categoryFilter]);
const getDiscountColor = (type) => {
    switch (type) {
      case "percent":
        return "bg-orange-500"; // cam
      case "FreeShipping":
        return "bg-green-500"; // xanh lá
      case "fixed":
        return "bg-pink-500"; // hồng
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="p-6">
      {/* --- Header --- */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        {/* Tiêu đề */}
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
          <TicketPercent className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          Quản lý Vouchers
        </h2>

        {/* Search & Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <input
              type="text"
              placeholder="Tìm kiếm voucher..."
              className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="px-3 text-gray-400 border-l border-gray-200">
              <Search size={20} />
            </div>
          </div>

          {/* Nút làm mới */}
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            <RefreshCcw className="w-4 h-4" /> Làm mới
          </button>

          {/* Nút thêm mới */}
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-600 transition"
          >
            <PlusCircle className="w-5 h-5" /> Thêm mới
          </button>
        </div>
      </div>


      {/* Table
      <div className="overflow-auto border rounded-2xl shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
          </div>
        )}

        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-indigo-50 sticky top-0 z-10 text-indigo-700">
            <tr>
              {["#", "Mã Voucher", "Mô tả", "Loại giảm", "Giá trị", "Bắt đầu", "Hết hạn", "Active", "Stores", "Products", "Categories", "Actions"].map((title) => (
                <th key={title} className="px-4 py-3 font-semibold text-left">{title}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center p-6 text-gray-500 italic">Không có voucher nào</td>
              </tr>
            ) : (
              currentData.map((v, idx) => (
                <tr key={v.voucherId} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-3 font-medium">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-indigo-700">{v.code}</td>
                  <td className="px-4 py-3">{v.descriptionVou}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-xs capitalize">{v.discountType}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">{v.discountValue}</td>
                  <td className="px-4 py-3">{v.startDate}</td>
                  <td className="px-4 py-3">{v.expiryDate}</td>
                  <td className="px-4 py-3 text-center">
                    {v.isActive ? <span className="text-green-600 font-bold">✔</span> : <span className="text-red-500 font-bold">✘</span>}
                  </td>

                  <td className="px-4 py-3">{v.stores?.map((s, i) => <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{s.storeName}</span>) || <span className="text-gray-400 italic">Không có</span>}</td>
                  <td className="px-4 py-3">{v.products?.map((p, i) => <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{p.productName}</span>) || <span className="text-gray-400 italic">Không có</span>}</td>
                  <td className="px-4 py-3">{v.categories?.map((c, i) => <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{c.categoryName}</span>) || <span className="text-gray-400 italic">Không có</span>}</td>

                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button onClick={() => openModal(v)} className="text-blue-600 hover:text-blue-800 transition"><Edit2 size={16} /></button>
                    <button onClick={() => { setToDelete(v); setConfirmOpen(true); }} className="text-red-600 hover:text-red-800 transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div> */}
      
      {/* Table */}
<div className="overflow-auto border rounded-xl shadow relative">
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
    </div>
  )}

  <table className="min-w-full border-collapse text-sm">
    <thead className="bg-indigo-50 sticky top-0 z-10 text-indigo-700">
      <tr>
        {["#", "Mã", "Mô tả", "Loại", "Giá trị", "Bắt đầu", "Hết hạn", "Active", "Stores", "Products", "Categories", "Actions"].map((title) => (
          <th key={title} className="px-3 py-2 font-semibold text-left">{title}</th>
        ))}
      </tr>
    </thead>

    <tbody>
      {currentData.length === 0 ? (
        <tr>
          <td colSpan={12} className="text-center py-6 text-gray-500 italic">Không có voucher nào</td>
        </tr>
      ) : (
        currentData.map((v, idx) => (
          <tr key={v.voucherId} className="hover:bg-indigo-50 transition">
            <td className="px-3 py-2 font-medium text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className="px-3 py-2 font-medium text-indigo-700">{v.code}</td>
            <td className="px-3 py-2 truncate max-w-[120px]" title={v.descriptionVou}>{v.descriptionVou}</td>
            <td className="px-3 py-2">
  <span
    className={`px-2 py-0.5 rounded text-white text-xs capitalize ${getDiscountColor(v.discountType)}`}
  >
    {v.discountType}
  </span>
</td>
            <td className="px-3 py-2 font-semibold text-green-600">{v.discountValue}</td>
            <td className="px-3 py-2">{v.startDate}</td>
            <td className="px-3 py-2">{v.expiryDate}</td>
            <td className="px-3 py-2 text-center">{v.isActive ? <span className="text-green-600 font-bold">✔</span> : <span className="text-red-500 font-bold">✘</span>}</td>

            <td className="px-3 py-2 max-w-[120px] truncate" title={v.stores?.map(s => s.storeName).join(", ")}>
              {v.stores?.map((s, i) => (
                <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{s.storeName}</span>
              )) || <span className="text-gray-400 italic">Không có</span>}
            </td>

            <td className="px-3 py-2 max-w-[120px] truncate" title={v.products?.map(p => p.productName).join(", ")}>
              {v.products?.map((p, i) => (
                <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{p.productName}</span>
              )) || <span className="text-gray-400 italic">Không có</span>}
            </td>

            <td className="px-3 py-2 max-w-[120px] truncate" title={v.categories?.map(c => c.categoryName).join(", ")}>
              {v.categories?.map((c, i) => (
                <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded mr-1 mb-1 text-xs">{c.categoryName}</span>
              )) || <span className="text-gray-400 italic">Không có</span>}
            </td>

            <td className="px-3 py-2 flex gap-2 justify-center">
              <button onClick={() => openModal(v)} className="text-blue-600 hover:text-blue-800 transition"><Edit2 size={16} /></button>
              <button onClick={() => { setToDelete(v); setConfirmOpen(true); }} className="text-red-600 hover:text-red-800 transition"><Trash2 size={16} /></button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      {/* Pagination */}
      {filteredVouchers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(page * PAGE_SIZE, filteredVouchers.length)}</span> / {filteredVouchers.length} bản ghi
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
        <VouchersModal
          close={() => setModalOpen(false)}
          refresh={refreshVoucher}
          editData={editData}
          stores={stores}
          products={products}
          categories={categories}
        />
      )}

      {/* ConfirmDialog */}
      {confirmOpen && toDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa voucher "${toDelete.code}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => handleDelete(toDelete.voucherId)}
        />
      )}
    </div>
  );
};

export default VouchersManagement;

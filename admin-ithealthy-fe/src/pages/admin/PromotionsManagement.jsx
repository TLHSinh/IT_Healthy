// src/pages/admin/PromotionsManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, RefreshCcw, Tag, Search } from "lucide-react";
import PromotionsModal from "../../components/admin/PromotionModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8;

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Data phụ
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Phân trang + search/filter
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔹 Fetch options
  const fetchOptions = async () => {
    try {
      const [s, p, c] = await Promise.all([
        axios.get("http://localhost:5000/api/Stores"),
        axios.get("http://localhost:5000/api/Products/all-products"),
        axios.get("http://localhost:5000/api/Category/category_pro"),
      ]);
      setStores(s.data);
      setProducts(p.data);
      setCategories(c.data);
    } catch {
      toast.error("Lỗi tải dữ liệu phụ!");
    }
  };

  // 🔹 Fetch promotions
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/Promotions");
      const full = await Promise.all(
        res.data.map(async (item) => {
          const detail = await axios.get(`http://localhost:5000/api/Promotions/${item.promotionId}`);
          return detail.data;
        })
      );
      setPromotions(full);
    } catch {
      toast.error("Lỗi tải promotions!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchPromotions();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (promo) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/Promotions/${promo.promotionId}`);
      setEditData(res.data);
      setModalOpen(true);
    } catch {
      toast.error("Không lấy được dữ liệu!");
    }
  };

  const handleConfirmDelete = (p) => {
    setToDelete(p);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/Promotions/${toDelete.promotionId}`);
      toast.success("Đã xóa khuyến mãi!");
      setPromotions((prev) => prev.filter((x) => x.promotionId !== toDelete.promotionId));
    } catch {
      toast.error("Xóa thất bại!");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  // 🔹 Filter + search
  const filteredPromotions = promotions
    .filter((p) => p.promotionName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => {
      if (statusFilter === "") return true;
      if (statusFilter === "active") return p.isActive;
      return !p.isActive;
    });

  const totalPages = Math.ceil(filteredPromotions.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentPageData = filteredPromotions.slice(startIndex, startIndex + PAGE_SIZE);

  // 🔹 Refresh sau khi thêm/sửa
  const refreshPromotion = async (data) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/Promotions/${data.promotionId}`);
      const fullData = res.data;
      setPromotions((prev) => {
        const exists = prev.find((x) => x.promotionId === fullData.promotionId);
        return exists
          ? prev.map((x) => (x.promotionId === fullData.promotionId ? fullData : x))
          : [...prev, fullData];
      });
    } catch {
      console.error("Refresh lỗi");
    }
  };

  return (
    <div className="p-6">
      {/* --- Header --- */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        {/* Tiêu đề */}
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
          <Tag className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          Quản lý Khuyến mãi
        </h2>

        {/* Search, Filter & Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi..."
              className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="px-3 text-gray-400 border-l border-gray-200">
              <Search size={20} />
            </div>
          </div>

          {/* Select trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng</option>
          </select>

          {/* Nút làm mới */}
          <button
            onClick={fetchPromotions}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            <RefreshCcw className="w-4 h-4" /> Làm mới
          </button>

          {/* Nút thêm mới */}
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-600 transition"
          >
            <PlusCircle className="w-5 h-5" /> Thêm mới
          </button>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              {["#", "Tên", "Mô tả", "Loại giảm", "Giá trị", "Từ", "Đến", "Active", "Stores", "Products", "Categories", "Actions"].map((title) => (
                <th key={title} className="px-4 py-3 font-semibold">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="12" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : currentPageData.length === 0 ? (
              <tr><td colSpan="12" className="p-6 text-center text-gray-500">Không có dữ liệu</td></tr>
            ) : (
              currentPageData.map((p, index) => (
                <tr key={p.promotionId} className="border-t hover:bg-indigo-50/30 transition">
                  <td className="px-4 py-3 font-medium">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{p.promotionName}</td>
                  <td className="px-4 py-3">{p.descriptionPromotion}</td>
                  <td className="px-4 py-3">{p.discountType}</td>
                  <td className="px-4 py-3">{p.discountValue}</td>
                  <td className="px-4 py-3">{p.startDate}</td>
                  <td className="px-4 py-3">{p.endDate}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.isActive ? "Hoạt động" : "Ngừng"}
                      </span>
                    
                  </td>
                  <td className="px-4 py-3">{p.stores?.join(", ")}</td>
                  <td className="px-4 py-3">{p.products?.join(", ")}</td>
                  <td className="px-4 py-3">{p.categories?.join(", ")}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"><Edit2 size={18} /></button>
                    <button onClick={() => handleConfirmDelete(p)} className="p-2 rounded-lg hover:bg-yellow-50 text-red-600 transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredPromotions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredPromotions.length, page * PAGE_SIZE)}</span> / {filteredPromotions.length} bản ghi
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">« Đầu</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">← Trước</button>
            <span className="px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Sau →</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Cuối »</button>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmOpen && toDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn chắc chắn muốn xóa "${toDelete.promotionName}"?`}
          onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
          onConfirm={handleDelete}
        />
      )}

      {/* Modal thêm/sửa */}
      {modalOpen && (
        <PromotionsModal
          close={() => setModalOpen(false)}
          editData={editData}
          refresh={refreshPromotion}
          stores={stores}
          products={products}
          categories={categories}
        />
      )}
    </div>
  );
};

export default PromotionsManagement;

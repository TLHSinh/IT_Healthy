// pages/admin/PromotionsManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { PlusCircle, Edit2, Trash2, RefreshCcw, Gift } from "lucide-react";
import PromotionModal from "../../components/admin/PromotionModal";

const PAGE_SIZE = 8;

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalPromotion, setModalPromotion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOptions = async () => {
    try {
      const [storesRes, productsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stores"),
        axios.get("http://localhost:5000/api/products/all-products"),
        axios.get("http://localhost:5000/api/ingredient")
      ]);
      setStores(storesRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      toast.error("Lấy dữ liệu dropdown thất bại");
    }
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/promotions");
      setPromotions(res.data);
    } catch {
      toast.error("Lấy danh sách promotions thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotion) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Promotion "${promotion.promotionName}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/promotions/${promotion.promotionId}`);
      toast.success("Xóa thành công");
      fetchPromotions();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(() => {
    return promotions.filter(p =>
      p.promotionName?.toLowerCase().includes(search.toLowerCase()) ||
      p.descriptionPromotion?.toLowerCase().includes(search.toLowerCase())
    );
  }, [promotions, search]);

  const totalPages = Math.ceil(filteredPromotions.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredPromotions.slice(startIndex, endIndex);

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Gift className="text-indigo-600" /> Quản lý Promotion
        </h2>
        <div className="flex flex-wrap gap-2">
            <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
          className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
          <button onClick={fetchPromotions} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">
            <RefreshCcw size={16}/> Làm mới
          </button>
          <button onClick={() => { setModalPromotion(null); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg">
            <PlusCircle size={18}/> Tạo Promotion
          </button>
        </div>
      </div>

      

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Tên Promotion</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Loại giảm</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Đơn tối thiểu</th>
              <th className="px-4 py-3">Ngày bắt đầu</th>
              <th className="px-4 py-3">Ngày kết thúc</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-center">Cửa hàng</th>
              <th className="px-4 py-3 text-center">Sản phẩm</th>
              <th className="px-4 py-3 text-center">Danh mục</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="13" className="p-6 text-center text-gray-500">Không có dữ liệu.</td>
              </tr>
            ) : (
              currentPageData.map((p, idx) => (
                <tr key={p.promotionId} className="border-t hover:bg-indigo-50/30 transition">
                  <td className="px-4 py-3">{startIndex + idx + 1}</td>
                  <td className="px-4 py-3">{p.promotionName}</td>
                  <td className="px-4 py-3">{p.descriptionPromotion}</td>
                  <td className="px-4 py-3">{p.discountType}</td>
                  <td className="px-4 py-3">{p.discountValue}</td>
                  <td className="px-4 py-3">{p.minOrderAmount}</td>
                  <td className="px-4 py-3">{p.startDate}</td>
                  <td className="px-4 py-3">{p.endDate}</td>
                  <td className="px-4 py-3">{p.isActive ? "Yes" : "No"}</td>

                  <td className="px-4 py-3 text-center flex flex-wrap justify-center gap-1">
                    {p.promotionStores?.map(s => (
                      <span key={s.storeId} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">{s.storeName}</span>
                    ))}
                  </td>

                  <td className="px-4 py-3 text-center flex flex-wrap justify-center gap-1">
                    {p.promotionProducts?.map(pr => (
                      <span key={pr.productId} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{pr.productName}</span>
                    ))}
                  </td>

                  <td className="px-4 py-3 text-center flex flex-wrap justify-center gap-1">
                    {p.promotionCategories?.map(c => (
                      <span key={c.categoryId} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">{c.categoryName}</span>
                    ))}
                  </td>
                  

                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button onClick={() => { setModalPromotion(p); setShowModal(true); }} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {!loading && filteredPromotions.length > 0 && (
        <div className="flex items-center justify-between mt-6 gap-3 text-sm">
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredPromotions.length, page * PAGE_SIZE)}</span> / {filteredPromotions.length} bản ghi
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 rounded-full border bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50">« Đầu</button>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 rounded-full border bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50">← Trước</button>
            <span className="px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50">Sau →</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 rounded-full border bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50">Cuối »</button>
          </div>
        </div>
      )}

      {showModal && (
        <PromotionModal
          promotion={modalPromotion}
          onClose={() => setShowModal(false)}
          onSaved={fetchPromotions}
          stores={stores}
          products={products}
          categories={categories}
        />
      )}
    </div>
  );
};

export default PromotionsManagement;

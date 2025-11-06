import React, { useEffect, useState, useMemo } from "react";
import { adminApi } from "../../api/adminApi";
import { PlusCircle, Trash2, Edit2, RefreshCcw, Package, Grid, List } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import ProductModal from "../../components/admin/ProductModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table hoặc card
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // 🔹 Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllProducts();
      const data = res.data || res;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách:", err);
      toast.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Thêm mới
  const handleAddNew = () => {
    setCurrentProduct(null);
    setModalOpen(true);
  };

  // 🔹 Sửa
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  // 🔹 Xóa
  const handleDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.productId;

    try {
      await adminApi.deleteProduct(id);
      toast.success("Đã xóa sản phẩm thành công!");
      setProducts((prev) => prev.filter((p) => p.productId !== id));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error(err?.response?.data?.message || err.message || "Không thể xóa sản phẩm!");
    } finally {
      setConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  // 🔹 Danh sách danh mục có trong dữ liệu
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryName));
    return ["Tất cả", ...Array.from(cats)];
  }, [products]);

  // 🔹 Lọc và tìm kiếm
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory && filterCategory !== "Tất cả"
        ? p.categoryName === filterCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [products, search, filterCategory]);

  // --- Phân trang ---
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredProducts.slice(startIndex, endIndex);

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <Package className="text-indigo-600" /> Quản lý sản phẩm
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
            <button
            onClick={fetchProducts}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
            >
            <RefreshCcw size={16} /> Làm mới
            </button>
            <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
            onClick={handleAddNew}
            >
            <PlusCircle size={18} /> Thêm sản phẩm
            </button>

            {/* 2 Button chuyển chế độ */}
            <div className="flex gap-2 border rounded-lg overflow-hidden">
            <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-4 py-2 transition ${
                viewMode === "table" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
                <List size={16} /> Table
            </button>
            <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1 px-4 py-2 transition ${
                viewMode === "card" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
                <Grid size={16} /> Card
            </button>
            </div>
        </div>
        </div>


      {/* Bộ lọc & tìm kiếm */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="border rounded px-3 py-2"
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm..."
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 text-left">
              <tr>
                {["#", "Ảnh", "Tên", "Mô tả", "Danh mục", "Trạng thái", "Thao tác"].map(
                  (title) => (
                    <th key={title} className="px-4 py-3 font-semibold">
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                currentPageData.map((p, index) => (
                  <tr
                    key={p.productId}
                    className="border-t hover:bg-indigo-50/30 transition"
                  >
                    <td className="px-4 py-3 text-gray-700 font-medium">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <img src={p.imageProduct} alt={p.productName} className="h-16 w-16 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3">{p.productName}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{p.descriptionProduct}</td>
                    <td className="px-4 py-3">{p.categoryName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.isAvailable ? "Có hàng" : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                          title="Sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setProductToDelete(p); setConfirmOpen(true); }}
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
      ) : (
        // Chế độ Card
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {loading ? (
            <p className="text-center col-span-full">Đang tải dữ liệu...</p>
        ) : currentPageData.length === 0 ? (
            <p className="text-center col-span-full">Không có sản phẩm nào.</p>
        ) : (
            currentPageData.map((p) => (
            <div
                key={p.productId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden"
            >
                {/* Image + Overlay trạng thái */}
                <div className="relative">
                {/* Ảnh sản phẩm + trạng thái */}
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                <img
                    src={p.imageProduct}
                    alt={p.productName}
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                />
                <span
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    p.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                >
                    {p.isAvailable ? "Có hàng" : "Hết hàng"}
                </span>
        </div>
                <span
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    p.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                >
                    {p.isAvailable ? "Có hàng" : "Hết hàng"}
                </span>
        </div>

        {/* Nội dung */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{p.productName}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-3">{p.descriptionProduct}</p>
          <p className="text-sm font-medium text-indigo-600 mb-4">Danh mục: {p.categoryName}</p>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleEdit(p)}
              className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 shadow-md hover:shadow-lg transition"
              title="Chỉnh sửa"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => { setProductToDelete(p); setConfirmOpen(true); }}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 shadow-md hover:shadow-lg transition"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    ))
  )}
</div>
      )}

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm flex-wrap gap-3">
          <div className="text-gray-600">
            Hiển thị <strong>{Math.min(filteredProducts.length, page * PAGE_SIZE)}</strong> / {filteredProducts.length} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              ← Trước
            </button>
            <span className="px-2">Trang <strong>{page}</strong> / {totalPages}</span>
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

      {confirmOpen && productToDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete.productName}"?`}
          onCancel={() => { setConfirmOpen(false); setProductToDelete(null); }}
          onConfirm={handleDelete}
        />
      )}

      {modalOpen && (
        <ProductModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          product={currentProduct}
          refreshList={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductManagement;

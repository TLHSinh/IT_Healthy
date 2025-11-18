import React, { useEffect, useState, useMemo } from "react";
import { adminApi } from "../../api/adminApi";
import { PlusCircle, Trash2, Edit2, RefreshCcw, Package, Grid, List, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import ProductModal from "../../components/admin/ProductModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ProductIngredientsModal from "../../components/admin/ProductIngredientsModal"; // modal quản lý nguyên liệu

const PAGE_SIZE = 8;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("table"); 
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // modal quản lý nguyên liệu
  const [ingredientsModalOpen, setIngredientsModalOpen] = useState(false);
  const [productForIngredients, setProductForIngredients] = useState(null);

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

  const handleAddNew = () => {
    setCurrentProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.productId;

    try {
      setLoading(true);
      await adminApi.deleteProduct(id);
      toast.success("Đã xóa sản phẩm thành công!");
      setProducts((prev) => prev.filter((p) => p.productId !== id));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error(err?.response?.data?.message || err.message || "Không thể xóa sản phẩm!");
    } finally {
      setConfirmOpen(false);
      setProductToDelete(null);
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryName));
    return ["Tất cả", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory && filterCategory !== "Tất cả"
        ? p.categoryName === filterCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [products, search, filterCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentPageData = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenIngredientsModal = (product) => {
    setProductForIngredients(product);
    setIngredientsModalOpen(true);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- Header --- */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        {/* Tiêu đề */}
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
          <Package className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          Quản lý sản phẩm
        </h2>

        {/* Search, Filter & Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Bộ lọc & tìm kiếm */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              className="border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm..."
                className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <div className="px-3 text-gray-400 border-l border-gray-200">
                <Search size={20} />
              </div>
            </div>
          </div>

          {/* Nút làm mới */}
          <button
            onClick={fetchProducts}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            <RefreshCcw className="w-4 h-4" /> Làm mới
          </button>

          {/* Nút thêm sản phẩm */}
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition"
          >
            <PlusCircle className="w-5 h-5" /> Thêm sản phẩm
          </button>

          {/* Chuyển chế độ Table / Card */}
          {/* <div className="flex gap-2 border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-4 py-2 transition ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <List className="w-4 h-4" /> Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1 px-4 py-2 transition ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <Grid className="w-4 h-4" /> Card
            </button>
          </div> */}
          {/* Chuyển chế độ Table / Card chỉ icon */}
          <div className="flex gap-2 border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center px-2 py-2 transition ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              title="Table view"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center justify-center px-2 py-2 transition ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              title="Card view"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Mode */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 text-left">
              <tr>
                {["#", "Ảnh", "Tên", "Mô tả", "Danh mục", "Trạng thái", "Nguyên liệu", "Thao tác"].map(
                  (title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : currentPageData.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-500">Không có sản phẩm nào.</td></tr>
              ) : (
                currentPageData.map((p, index) => (
                  <tr key={p.productId} className="border-t hover:bg-indigo-50/30 transition">
                    <td className="px-4 py-3 text-gray-700 font-medium">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <img src={p.imageProduct} alt={p.productName} className="h-16 w-16 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3">{p.productName}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{p.descriptionProduct}</td>
                    <td className="px-4 py-3">{p.categoryName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isAvailable ? "Có hàng" : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleOpenIngredientsModal(p)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium">Nguyên liệu</button>
                    </td>
                    <td className="px-4 py-3"> 
                      <div className="flex items-center gap-2"> 
                        <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Sửa" > <Edit2 size={18} /> 
                        </button> 
                        <button onClick={() => { setProductToDelete(p); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Xóa" > <Trash2 size={18} /> 
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
        // Card Mode
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-center col-span-full">Đang tải dữ liệu...</p>
          ) : currentPageData.length === 0 ? (
            <p className="text-center col-span-full">Không có sản phẩm nào.</p>
          ) : (
            currentPageData.map((p) => (
              <div key={p.productId} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden">
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                  <img src={p.imageProduct} alt={p.productName} className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"/>
                  <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${p.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {p.isAvailable ? "Có hàng" : "Hết hàng"}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{p.productName}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-3">{p.descriptionProduct}</p>
                  <p className="text-sm font-medium text-indigo-600 mb-4">Danh mục: {p.categoryName}</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 shadow-md hover:shadow-lg transition" title="Chỉnh sửa"><Edit2 size={18} /></button>
                    <button onClick={() => { setProductToDelete(p); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600 shadow-md hover:shadow-lg transition" title="Xóa"><Trash2 size={18} /></button>
                    <button onClick={() => handleOpenIngredientsModal(p)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium">Nguyên liệu</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modern Pagination */}
{!loading && filteredProducts.length > 0 && (
  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
    {/* Thông tin bản ghi */}
    <div className="text-gray-600 font-medium">
      Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredProducts.length, page * PAGE_SIZE)}</span> / {filteredProducts.length} bản ghi
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

      {ingredientsModalOpen && productForIngredients && (
        <ProductIngredientsModal
          isOpen={ingredientsModalOpen}
          onClose={() => setIngredientsModalOpen(false)}
          editItem={productForIngredients}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductManagement;

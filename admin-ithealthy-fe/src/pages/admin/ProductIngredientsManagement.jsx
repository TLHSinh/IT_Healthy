import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Edit2, RefreshCcw, UtensilsCrossed, Grid, List } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import ProductIngredientsModal from "../../components/admin/ProductIngredientModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const PAGE_SIZE = 8;

const ProductIngredientsManagement = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [search, setSearch] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/ProductIngredients");
      setList(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/ProductIngredients/${itemToDelete.productIngredientId}`);
      toast.success("Đã xóa thành công!");
      setList(prev => prev.filter(x => x.productIngredientId !== itemToDelete.productIngredientId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xóa!");
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSuccess = (action) => {
  fetchList();
  setEditItem(null);
  if (action === "add") toast.success("Thêm nguyên liệu cho sản phẩm thành công!");
  if (action === "edit") toast.success("Cập nhật nguyên liệu cho sản phẩm thành công!");
};

  const filteredList = useMemo(() => {
    return list.filter(
      x => x.productName.toLowerCase().includes(search.toLowerCase()) ||
           x.ingredientName.toLowerCase().includes(search.toLowerCase())
    );
  }, [list, search]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentPageData = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header + Search + Controls */}
<div className="flex flex-wrap items-center justify-between mb-6 gap-3">
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
      <UtensilsCrossed className="text-indigo-600" /> Quản lý Product - Ingredients
    </h2>
    <p className="text-gray-500 text-sm mt-1">
      Quản lý danh sách nguyên liệu và định lượng cho từng sản phẩm.
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
    
    {/* Thanh search */}
    <input
      type="text"
      placeholder="Tìm kiếm sản phẩm hoặc nguyên liệu..."
      className="border rounded-lg px-4 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
    />

{/* Nút làm mới */}
    <button
      onClick={fetchList}
      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
    >
      <RefreshCcw size={16} /> Làm mới
    </button>
    
    {/* Nút thêm mới */}
    <button
      onClick={() => { setEditItem(null); setModalOpen(true); }}
      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
    >
      <PlusCircle size={18} /> Thêm mới
    </button>

    {/* Chuyển chế độ Table / Card */}
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


      

      {/* Table Mode */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 text-left">
              <tr>
                {["#", "Sản phẩm", "Nguyên liệu", "Số lượng", "Hành động"].map(title => (
                  <th key={title} className="px-4 py-3 font-semibold">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">Không có dữ liệu.</td>
                </tr>
              ) : (
                currentPageData.map((item, idx) => (
                  <tr key={item.productIngredientId} className="border-t hover:bg-indigo-50/30 transition">
                    <td className="px-4 py-3 text-gray-700 font-medium">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3">{item.productName}</td>
                    <td className="px-4 py-3">{item.ingredientName}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setItemToDelete(item); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
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
        // Card Mode
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-center col-span-full">Đang tải dữ liệu...</p>
          ) : currentPageData.length === 0 ? (
            <p className="text-center col-span-full">Không có dữ liệu.</p>
          ) : (
            currentPageData.map(item => (
              <div key={item.productIngredientId} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2">Nguyên liệu: {item.ingredientName}</p>
                  <p className="text-sm text-gray-500 mb-4">Số lượng: {item.quantity}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 shadow-md hover:shadow-lg transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => { setItemToDelete(item); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600 shadow-md hover:shadow-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredList.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm flex-wrap gap-3">
          <div className="text-gray-600">
            Hiển thị <strong>{Math.min(filteredList.length, page * PAGE_SIZE)}</strong> / {filteredList.length} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">← Trước</button>
            <span className="px-2">Trang <strong>{page}</strong> / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">Sau →</button>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmOpen && itemToDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa nguyên liệu "${itemToDelete.ingredientName}" khỏi sản phẩm "${itemToDelete.productName}"?`}
          onCancel={() => { setConfirmOpen(false); setItemToDelete(null); }}
          onConfirm={handleDelete}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductIngredientsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
          editItem={editItem}
        />
      )}
    </div>
  );
};

export default ProductIngredientsManagement;

import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, RefreshCcw, Grid, List, Edit2, Trash2 } from "lucide-react";
import IngredientModal from "../../components/admin/IngredientModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { Leaf } from "lucide-react";

const PAGE_SIZE = 8;

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table hoặc card
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 🔹 Lấy danh sách nguyên liệu
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/ingredient");
      setIngredients(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách nguyên liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // 🔹 Thêm / Sửa
  const handleAddNew = () => {
    setCurrentIngredient(null);
    setModalOpen(true);
  };
  const handleEdit = (ingredient) => {
    setCurrentIngredient(ingredient);
    setModalOpen(true);
  };

  // 🔹 Xóa
  const handleDelete = async () => {
    if (!ingredientToDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/ingredient/${ingredientToDelete.ingredientId}`);
      toast.success("Đã xóa nguyên liệu thành công!");
      setIngredients((prev) =>
        prev.filter((i) => i.ingredientId !== ingredientToDelete.ingredientId)
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Không thể xóa nguyên liệu!");
    } finally {
      setConfirmOpen(false);
      setIngredientToDelete(null);
    }
  };

  // 🔹 Lọc & tìm kiếm
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((i) =>
      i.ingredientName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, search]);

  // --- Phân trang ---
  const totalPages = Math.ceil(filteredIngredients.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredIngredients.slice(startIndex, endIndex);

  return (
    <div >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Leaf className="text-indigo-600" /> Quản lý nguyên liệu
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm nguyên liệu..."
            className="border rounded px-3 py-2 flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={fetchIngredients}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <RefreshCcw size={16} /> Làm mới
          </button>
          <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
            onClick={handleAddNew}
          >
            <PlusCircle size={18} /> Thêm nguyên liệu
          </button>

          {/* 2 Button chuyển chế độ */}
          <div className="flex gap-2 border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-4 py-2 transition ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <List size={16} /> Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1 px-4 py-2 transition ${
                viewMode === "card"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Grid size={16} /> Card
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 text-left">
              <tr>
                {["#", "Tên", "Đơn vị", "Giá gốc", "Calories", "Protein", "Carbs", "Fat", "Trạng thái", "Hành động"].map(
                  (title) => (
                    <th key={title} className="px-4 py-3 font-semibold">{title}</th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">Không có nguyên liệu nào.</td>
                </tr>
              ) : (
                currentPageData.map((i, idx) => (
                  <tr key={i.ingredientId} className="border-t hover:bg-indigo-50/30 transition">
                    <td className="px-4 py-3">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3">{i.ingredientName}</td>
                    <td className="px-4 py-3">{i.unit}</td>
                    <td className="px-4 py-3">{i.basePrice?.toLocaleString()} đ</td>
                    <td className="px-4 py-3">{i.calories}</td>
                    <td className="px-4 py-3">{i.protein}</td>
                    <td className="px-4 py-3">{i.carbs}</td>
                    <td className="px-4 py-3">{i.fat}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${i.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {i.isAvailable ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(i)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setIngredientToDelete(i); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Xóa">
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
        // Card mode
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-center col-span-full">Đang tải dữ liệu...</p>
          ) : currentPageData.length === 0 ? (
            <p className="text-center col-span-full">Không có nguyên liệu nào.</p>
          ) : (
            currentPageData.map((i) => (
              <div key={i.ingredientId} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden">
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                  <img src={i.imageIngredients || "/no-image.png"} alt={i.ingredientName} className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" />
                  <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${i.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {i.isAvailable ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{i.ingredientName}</h3>
                  <p className="text-sm text-gray-500 mb-1">Đơn vị: {i.unit}</p>
                  <p className="text-sm text-gray-500 mb-4">Giá: {i.basePrice?.toLocaleString()} đ</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(i)} className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 shadow-md hover:shadow-lg transition" title="Sửa">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => { setIngredientToDelete(i); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-red-600 shadow-md hover:shadow-lg transition" title="Xóa">
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
      {!loading && filteredIngredients.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm flex-wrap gap-3">
          <div className="text-gray-600">
            Hiển thị <strong>{Math.min(filteredIngredients.length, page * PAGE_SIZE)}</strong> / {filteredIngredients.length} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">← Trước</button>
            <span className="px-2">Trang <strong>{page}</strong> / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">Sau →</button>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmOpen && ingredientToDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa nguyên liệu "${ingredientToDelete.ingredientName}"?`}
          onCancel={() => { setConfirmOpen(false); setIngredientToDelete(null); }}
          onConfirm={handleDelete}
        />
      )}

      {/* Modal CRUD */}
      {modalOpen && (
        <IngredientModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          ingredient={currentIngredient}
          onSaved={fetchIngredients}
        />
      )}
    </div>
  );
};

export default IngredientManagement;

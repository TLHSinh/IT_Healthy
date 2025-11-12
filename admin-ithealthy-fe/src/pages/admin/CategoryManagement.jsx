import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, Edit2, Trash2, RefreshCcw, Folder } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import CategoryModal from "../../components/admin/CategoryModal";

const BASE_URL = "http://localhost:5000/api/category";
const PAGE_SIZE = 8;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/category_pro`);
      setCategories(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (form) => {
    try {
      if (selected) {
        await axios.put(`${BASE_URL}/category_pro/${selected.categoryId}`, form);
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post(`${BASE_URL}/category_pro`, form);
        toast.success("Thêm mới thành công!");
      }
      setOpenModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Thao tác thất bại!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này không?")) return;
    try {
      await axios.delete(`${BASE_URL}/category_pro/${id}`);
      toast.success("Đã xóa thành công!");
      fetchCategories();
    } catch {
      toast.error("Không thể xóa danh mục!");
    }
  };

  // 🔍 Lọc và tìm kiếm
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.categoryName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  // 🔹 Phân trang
  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredCategories.slice(startIndex, endIndex);

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Folder className="text-indigo-600" />
          Danh mục Sản phẩm
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={fetchCategories}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <RefreshCcw size={16} /> Làm mới
          </button>

          <button
            onClick={() => {
              setSelected(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
          >
            <PlusCircle size={18} /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Ô tìm kiếm */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên danh mục..."
          className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Bảng danh mục */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Tên danh mục</th>
              <th className="px-4 py-3 font-semibold">Mô tả</th>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              currentPageData.map((cat, index) => (
                <tr
                  key={cat.categoryId}
                  className="border-t hover:bg-indigo-50/30 transition"
                >
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3">{cat.categoryName}</td>
                  <td className="px-4 py-3">{cat.descriptionCat}</td>
                  <td className="px-4 py-3">
                    {cat.imageCategories ? (
                      <img
                        src={cat.imageCategories}
                        alt={cat.categoryName}
                        className="h-16 w-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <span className="text-gray-400 italic">Không có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(cat);
                          setOpenModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.categoryId)}
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

      {/* Modern Pagination */}
      {!loading && filteredCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3 text-sm">
          {/* Thông tin bản ghi */}
          <div className="text-gray-600 font-medium">
            Hiển thị <span className="text-indigo-600 font-bold">{Math.min(filteredCategories.length, page * PAGE_SIZE)}</span> / {filteredCategories.length} bản ghi
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


      {/* Modal */}
      {openModal && (
        <CategoryModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSave={handleSave}
          category={selected}
          type="product"
        />
      )}
    </div>
  );
};

export default CategoryManagement;

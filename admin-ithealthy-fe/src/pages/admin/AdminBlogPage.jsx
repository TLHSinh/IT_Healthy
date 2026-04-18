import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BlogModal from "../../components/admin/BlogModal";
import { PlusCircle, Search, Edit2, Trash2, FileText, } from "lucide-react";

const PAGE_SIZE = 8;

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const API = "http://localhost:5000/api";

  // =========================================
  // FETCH BLOGS
  // =========================================
  const fetchBlogs = async () => {
    setLoading(true);

    try {
      let url = `${API}/blog/all-blogs`;
      if (keyword) url += `?keyword=${keyword}`;

      const res = await fetch(url);
      const data = await res.json();

      setBlogs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Lỗi load dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // =========================================
  // SAVE
  // =========================================
  const handleSave = async (data) => {
    const isEdit = !!data.blogId;

    const url = isEdit
      ? `${API}/blog/${data.blogId}`
      : `${API}/blog`;

    const formData = new FormData();

    formData.append("Title", data.title);
    formData.append("Description", data.description || "");
    //formData.append("Content", data.content || "");
    if (data.content !== undefined && data.content !== null) {
  formData.append("Content", data.content);
}
    formData.append("Category", data.category || "");
    formData.append("IsPublished", data.isPublished);

    if (data.imageFile) {
      formData.append("ImageFile", data.imageFile);
    }

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      body: formData,
    });

    if (!res.ok) throw new Error();

    toast.success(isEdit ? "Cập nhật thành công" : "Tạo thành công");
    fetchBlogs();
  };

  // =========================================
  // DELETE
  // =========================================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const res = await fetch(`${API}/blog/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Xóa thành công");
      fetchBlogs();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  // =========================================
  // FILTER
  // =========================================
  const filteredBlogs = blogs.filter((b) => {
    const matchSearch =
      b.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      b.category?.toLowerCase().includes(keyword.toLowerCase());

    const matchStatus =
      filterStatus === ""
        ? true
        : filterStatus === "published"
        ? b.isPublished
        : !b.isPublished;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredBlogs.length / PAGE_SIZE);
  const currentData = filteredBlogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [keyword, filterStatus]);

  // =========================================
  // UI
  // =========================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">

  {/* TITLE */}
  <h2 className="flex items-center gap-3 text-3xl font-extrabold text-indigo-600">
    <FileText className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
    Quản lý Blog
  </h2>

  {/* ACTIONS */}
  <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full lg:w-auto">

    {/* SEARCH */}
    <div className="flex items-center w-full sm:w-80 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm tiêu đề, danh mục..."
        className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      <div className="px-3 text-gray-400 border-l border-gray-200">
        <Search size={18} />
      </div>
    </div>

    {/* FILTER */}
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:border-indigo-400 hover:shadow-sm transition w-full sm:w-auto"
    >
      <option value="">Tất cả</option>
      <option value="published">Đã publish</option>
      <option value="draft">Nháp</option>
    </select>

    {/* SEARCH BUTTON */}
    <button
      onClick={fetchBlogs}
      className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition w-full sm:w-auto"
    >
      Tìm kiếm
    </button>

    {/* ADD BLOG */}
    <button
      onClick={() => {
        setSelectedBlog(null);
        setShowModal(true);
      }}
      className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition w-full sm:w-auto"
    >
      <PlusCircle size={18} />
      Thêm blog
    </button>

  </div>
</div>


      

      {/* TABLE */}
<div className="bg-white rounded-xl shadow overflow-x-auto relative">

  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  )}

  <table className="w-full text-sm">

    <thead className="bg-indigo-50 text-indigo-700">
      <tr>
        <th className="p-3 text-center">STT</th>
        <th className="p-3 text-center">Ảnh</th>
        <th className="p-3 text-center">Tiêu đề</th>
        <th className="p-3 text-center">Danh mục</th>
        <th className="p-3 text-center">Trạng thái</th>
        <th className="p-3 text-center">Hành động</th>
      </tr>
    </thead>

    <tbody>
      {currentData.map((b, index) => (
        <tr key={b.blogId} className="border-b hover:bg-gray-50">

          {/* STT */}
          <td className="p-3 text-center font-medium text-gray-600">
            {b.blogId}
          </td>

          {/* IMAGE */}
          <td className="p-3 text-center">
            <img
              src={b.image || "https://via.placeholder.com/80"}
              className="w-14 h-14 rounded object-cover mx-auto"
            />
          </td>

          {/* TITLE */}
          <td className="font-medium p-3 text-center">
            {b.title}
          </td>

          {/* CATEGORY */}
          <td className="p-3 text-center">
            {b.category}
          </td>

          {/* STATUS */}
          <td className="p-3 text-center">
            <span className={`px-3 py-1 rounded text-xs text-white ${
              b.isPublished ? "bg-green-500" : "bg-gray-400"
            }`}>
              {b.isPublished ? "Hiển thị" : "Ẩn"}
            </span>
          </td>

          {/* ACTION */}
          <td className="p-3">
            <div className="flex justify-center gap-3">

              <button
                onClick={() => {
                  setSelectedBlog(b);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:scale-110 transition"
              >
                <Edit2 size={18} />
              </button>

              <button
                onClick={() => handleDelete(b.blogId)}
                className="text-red-600 hover:scale-110 transition"
              >
                <Trash2 size={18} />
              </button>

            </div>
          </td>

        </tr>
      ))}
    </tbody>
  </table>
</div>

      {/* PAGINATION */}
<div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">

  {/* INFO */}
  <span className="text-gray-600 font-medium">
    Hiển thị{" "}
    <span className="text-indigo-600 font-bold">
      {currentData.length}
    </span>{" "}
    / {filteredBlogs.length} bản ghi
  </span>

  {/* BUTTONS */}
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

      {/* MODAL */}
      {showModal && (
        <BlogModal
          isOpen={showModal}
          setIsOpen={setShowModal}
          blog={selectedBlog}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
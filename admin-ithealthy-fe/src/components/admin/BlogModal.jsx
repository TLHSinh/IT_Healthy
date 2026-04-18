import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import { toast } from "react-toastify";

const BlogModal = ({ isOpen, setIsOpen, blog, onSave }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    blogId: null,
    title: "",
    description: "",
    content: "",
    category: "",
    isPublished: true,
    imageFile: null,
    imagePreview: "",
  });

  // 🔥 RESET FORM
  const resetForm = () => {
    setForm({
      blogId: null,
      title: "",
      description: "",
      content: "",
      category: "",
      isPublished: true,
      imageFile: null,
      imagePreview: "",
    });
  };

  // 🔥 LOAD DATA EDIT (FIX LỖI MẤT DATA)
  useEffect(() => {
    if (blog) {
      setForm({
        blogId: blog.blogId,
        title: blog.title || "",
        description: blog.description || "",
        content: blog.content || "",
        category: blog.category || "",
        isPublished: blog.isPublished ?? true,
        imageFile: null,
        imagePreview: blog.image || "",
      });
    } else {
      resetForm();
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề");
      return;
    }

    setLoading(true);
    try {
      await onSave(form);
      toast.success(blog ? "Cập nhật thành công" : "Tạo thành công");

      resetForm();
      setIsOpen(false);
    } catch (err) {
      toast.error("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-xl relative">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="font-bold text-lg">
            {blog ? "✏️ Cập nhật Blog" : "➕ Thêm Blog"}
          </h3>

          <button
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            <XCircle />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* IMAGE */}
          <div className="text-center">
            <label className="cursor-pointer">
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  className="w-32 h-32 object-cover mx-auto rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 border flex items-center justify-center mx-auto">
                  +
                </div>
              )}
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>

          {/* TITLE */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tiêu đề"
            className="w-full border p-2 rounded"
          />

          {/* CATEGORY */}
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Danh mục"
            className="w-full border p-2 rounded"
          />

          {/* DESCRIPTION */}
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả"
            className="w-full border p-2 rounded"
          />

          {/* CONTENT */}
          <textarea
            name="content"
            value={form.content || ""}
            onChange={handleChange}
            placeholder="Nội dung"
            className="w-full border p-2 rounded h-32"
          />

          {/* 🔥 TOGGLE HIỂN THỊ */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span>
              {form.isPublished ? "Đang hiển thị" : "Đang ẩn"}
            </span>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  isPublished: !prev.isPublished,
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                form.isPublished ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition ${
                  form.isPublished ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
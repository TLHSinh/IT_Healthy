import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { X, ImagePlus } from "lucide-react";
import { toast } from "react-hot-toast";

const ProductModal = ({ isOpen, setIsOpen, product, refreshList }) => {
  const [form, setForm] = useState({
    productName: "",
    descriptionProduct: "",
    categoryId: 1,
    isAvailable: true,
    imageFile: null,
    imagePreview: "",
  });

  // 🧩 Khi mở modal hoặc chọn sản phẩm sửa → load dữ liệu
  useEffect(() => {
    if (product) {
      setForm({
        productName: product.productName || "",
        descriptionProduct: product.descriptionProduct || "",
        categoryId: product.categoryId || 1,
        isAvailable: product.isAvailable ?? true,
        imageFile: null,
        imagePreview: product.imageProduct || "",
      });
    } else {
      setForm({
        productName: "",
        descriptionProduct: "",
        categoryId: 1,
        isAvailable: true,
        imageFile: null,
        imagePreview: "",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  // 🖊️ Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 📁 Xử lý chọn ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // 💾 Submit form (thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productName) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const payload = new FormData();
    payload.append("productName", form.productName);
    payload.append("descriptionProduct", form.descriptionProduct || "");
    payload.append("categoryId", Number(form.categoryId || 1));
    payload.append("isAvailable", form.isAvailable);
    if (form.imageFile) payload.append("ImageFile", form.imageFile);

    try {
      if (product) {
        await adminApi.updateProduct(product.productId, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Thêm sản phẩm thành công!");
      }
      refreshList();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-xl">
        {/* Đóng modal */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {product ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ảnh sản phẩm */}
          <div className="flex flex-col items-center gap-3">
            {form.imagePreview ? (
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border hover:opacity-80 transition"
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("fileUpload").click()
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Thay ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        imageFile: null,
                        imagePreview: "",
                      }))
                    }
                    className="text-sm text-red-500 hover:underline"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="fileUpload"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg text-gray-500 cursor-pointer hover:bg-gray-50 transition"
              >
                <ImagePlus className="mr-2" size={20} />
                Chọn ảnh từ thiết bị
              </label>
            )}

            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Tên sản phẩm */}
          <input
            type="text"
            name="productName"
            placeholder="Tên sản phẩm"
            value={form.productName}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Mô tả */}
          <textarea
            name="descriptionProduct"
            placeholder="Mô tả sản phẩm"
            value={form.descriptionProduct}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            rows={3}
          />

          {/* Danh mục */}
          <input
            type="number"
            name="categoryId"
            placeholder="ID danh mục (ví dụ: 1)"
            value={form.categoryId}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Trạng thái */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
            />
            <span>Còn hàng</span>
          </label>

          {/* Nút lưu */}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium transition"
          >
            {product ? "Cập nhật" : "Thêm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

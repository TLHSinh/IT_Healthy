import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { X, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const ProductModal = ({ isOpen, setIsOpen, product, refreshList }) => {
  const [form, setForm] = useState({
    productName: "",
    descriptionProduct: "",
    categoryName: "",
    isAvailable: true,
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        productName: product.productName || "",
        descriptionProduct: product.descriptionProduct || "",
        categoryName: product.categoryName || "",
        isAvailable: product.isAvailable ?? true,
        imageFile: null,
        imagePreview: product.imageProduct || "",
      });
    } else {
      setForm({
        productName: "",
        descriptionProduct: "",
        categoryName: "",
        isAvailable: true,
        imageFile: null,
        imagePreview: "",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productName || !form.categoryName) {
      toast.error("Tên sản phẩm và danh mục không được để trống!");
      return;
    }

    const payload = new FormData();
    payload.append("productName", form.productName);
    payload.append("descriptionProduct", form.descriptionProduct);
    payload.append("categoryName", form.categoryName);
    payload.append("isAvailable", form.isAvailable);
    if (form.imageFile) payload.append("imageFile", form.imageFile);

    try {
      if (product) {
        // Sửa
        await adminApi.updateProduct(product.productId, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm mới
        await adminApi.createProduct(payload);
        toast.success("Thêm sản phẩm thành công!");
      }

      refreshList();
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ảnh sản phẩm */}
          <div className="flex flex-col items-center gap-2">
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="preview"
                className="w-32 h-32 object-cover rounded"
              />
            )}
            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
              {form.imagePreview ? "Thay ảnh" : "Chọn ảnh"}
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
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
            type="text"
            name="categoryName"
            placeholder="Danh mục"
            value={form.categoryName}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Trạng thái */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
            />
            <span>Có hàng</span>
          </label>

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

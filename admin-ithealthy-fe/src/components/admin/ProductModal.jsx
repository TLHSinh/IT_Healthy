import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { X, ImagePlus } from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_FORM = {
  productName: "",
  descriptionProduct: "",
  categoryId: "",
  basePrice: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  isAvailable: true,
  imageFile: null,
  imagePreview: "",
};

const DECIMAL_FIELDS = ["basePrice", "calories", "protein", "carbs", "fat"];

const ProductModal = ({ isOpen, setIsOpen, product, refreshList }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const isEditMode = Boolean(product);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await adminApi.getProductCategories();
        const data = res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load categories failed:", err);
        toast.error("Không thể tải danh mục sản phẩm!");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setForm({
        productName: product.productName || "",
        descriptionProduct: product.descriptionProduct || "",
        categoryId:
          product.categoryId === null || product.categoryId === undefined
            ? ""
            : String(product.categoryId),
        basePrice: product.basePrice ?? "",
        calories: product.calories ?? "",
        protein: product.protein ?? "",
        carbs: product.carbs ?? "",
        fat: product.fat ?? "",
        isAvailable: product.isAvailable ?? true,
        imageFile: null,
        imagePreview: product.imageProduct || "",
      });
      return;
    }

    setForm(DEFAULT_FORM);
  }, [product, isOpen]);

  const categoryOptions = useMemo(() => categories || [], [categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ!");
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const validateForm = () => {
    if (!form.productName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return false;
    }

    for (const field of DECIMAL_FIELDS) {
      const value = form[field];
      if (value === "" || value === null) continue;

      const parsedValue = Number(value);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        toast.error("Các trường giá và dinh dưỡng phải là số không âm!");
        return false;
      }
    }

    if (form.categoryId !== "" && Number(form.categoryId) <= 0) {
      toast.error("Danh mục không hợp lệ!");
      return false;
    }

    return true;
  };

  const appendNullableNumber = (payload, key, value) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }

    payload.append(key, Number(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();
    payload.append("ProductName", form.productName.trim());
    payload.append("DescriptionProduct", form.descriptionProduct.trim());

    if (form.categoryId !== "") {
      payload.append("CategoryId", Number(form.categoryId));
    }

    appendNullableNumber(payload, "BasePrice", form.basePrice);
    appendNullableNumber(payload, "Calories", form.calories);
    appendNullableNumber(payload, "Protein", form.protein);
    appendNullableNumber(payload, "Carbs", form.carbs);
    appendNullableNumber(payload, "Fat", form.fat);
    payload.append("IsAvailable", form.isAvailable ? "true" : "false");

    if (form.imageFile) {
      payload.append("ImageFile", form.imageFile);
    }

    try {
      if (isEditMode) {
        await adminApi.updateProduct(product.productId, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Thêm sản phẩm thành công!");
      }

      await refreshList();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="mb-5 text-xl font-bold text-gray-800">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3">
            {form.imagePreview ? (
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    className="h-32 w-32 rounded-lg border object-cover transition hover:opacity-80"
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById("fileUpload")?.click()}
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
                className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 text-gray-500 transition hover:bg-gray-50"
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                placeholder="Nhập tên sản phẩm"
                value={form.productName}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mô tả sản phẩm
              </label>
              <textarea
                name="descriptionProduct"
                placeholder="Nhập mô tả sản phẩm"
                value={form.descriptionProduct}
                onChange={handleChange}
                className="w-full resize-none rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={loadingCategories}
              >
                <option value="">Chọn danh mục</option>
                {categoryOptions.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Giá cơ bản
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="basePrice"
                placeholder="Nhập giá sản phẩm"
                value={form.basePrice}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Calories
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="calories"
                placeholder="Nhập calories"
                value={form.calories}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="protein"
                placeholder="Nhập protein"
                value={form.protein}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="carbs"
                placeholder="Nhập carbs"
                value={form.carbs}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fat (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="fat"
                placeholder="Nhập fat"
                value={form.fat}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
            />
            <span>Còn hàng</span>
          </label>

          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
          >
            {isEditMode ? "Cập nhật" : "Thêm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

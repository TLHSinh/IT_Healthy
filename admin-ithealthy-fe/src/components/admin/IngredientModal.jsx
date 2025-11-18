// src/components/admin/IngredientModal.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus } from "lucide-react"; // icon cho upload

const IngredientModal = ({ visible, onClose, ingredient, onSaved }) => {
  const [form, setForm] = useState({
    ingredientName: "",
    unit: "",
    basePrice: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    imageIngredients: "",
    imageFile: null,
    imagePreview: "",
    isAvailable: true,
  });

  useEffect(() => {
    if (ingredient) {
      setForm({
        ingredientName: ingredient.ingredientName,
        unit: ingredient.unit,
        basePrice: ingredient.basePrice,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fat: ingredient.fat,
        imageIngredients: ingredient.imageIngredients || "",
        imageFile: null,
        imagePreview: ingredient.imageIngredients || "",
        isAvailable: ingredient.isAvailable ?? true,
      });
    } else {
      setForm({
        ingredientName: "",
        unit: "",
        basePrice: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        imageIngredients: "",
        imageFile: null,
        imagePreview: "",
        isAvailable: true,
      });
    }
  }, [ingredient]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

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

  const handleSave = async () => {
    if (!form.ingredientName || !form.unit) {
      toast.warning("Vui lòng điền tên nguyên liệu và đơn vị!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("IngredientName", form.ingredientName);
      formData.append("Unit", form.unit);
      formData.append("BasePrice", form.basePrice);
      formData.append("Calories", form.calories);
      formData.append("Protein", form.protein);
      formData.append("Carbs", form.carbs);
      formData.append("Fat", form.fat);
      formData.append("IsAvailable", form.isAvailable);

      if (form.imageFile) formData.append("ImageIngredients", form.imageFile);
      else if (form.imageIngredients) formData.append("ImageIngredients", form.imageIngredients);

      const url = ingredient
        ? `http://localhost:5000/api/ingredient/${ingredient.ingredientId}`
        : "http://localhost:5000/api/ingredient";
      const method = ingredient ? "PUT" : "POST";

      await fetch(url, { method, body: formData });
      toast.success(ingredient ? "Cập nhật nguyên liệu thành công!" : "Thêm nguyên liệu thành công!");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleDelete = async () => {
    if (!ingredient) return;
    try {
      await fetch(`http://localhost:5000/api/ingredient/${ingredient.ingredientId}`, { method: "DELETE" });
      toast.success("Đã xóa nguyên liệu thành công!");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xóa nguyên liệu!");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">
  {ingredient ? "✏️ Cập nhật nguyên liệu" : "➕ Thêm nguyên liệu"}
</h2>


        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {/* Tên nguyên liệu */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Sữa tươi, Bột cacao"
              value={form.ingredientName}
              onChange={(e) => handleChange("ingredientName", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Đơn vị */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: kg, g, chai"
              value={form.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Giá gốc */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá gốc (vnđ)</label>
            <input
              type="number"
              value={form.basePrice}
              onChange={(e) => handleChange("basePrice", parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Dinh dưỡng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Calories</label>
              <input
                type="number"
                value={form.calories}
                onChange={(e) => handleChange("calories", parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Protein (g)</label>
              <input
                type="number"
                value={form.protein}
                onChange={(e) => handleChange("protein", parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Carbs (g)</label>
              <input
                type="number"
                value={form.carbs}
                onChange={(e) => handleChange("carbs", parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fat (g)</label>
              <input
                type="number"
                value={form.fat}
                onChange={(e) => handleChange("fat", parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Ảnh nguyên liệu */}
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
                    onClick={() => document.getElementById("fileUpload").click()}
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

          {/* Trạng thái */}
          <div className="flex items-center space-x-2 mt-2">
            <span>Còn hàng:</span>
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => handleChange("isAvailable", e.target.checked)}
              className="h-5 w-5 text-blue-500 rounded border-gray-300"
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-4 flex justify-end gap-2">
          {ingredient && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Xóa
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientModal;

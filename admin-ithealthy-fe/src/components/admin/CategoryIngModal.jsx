import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const CategoryIngModal = ({ isOpen, onClose, onSave, category }) => {
  const [form, setForm] = useState({
    categoryName: "",
    descriptionCat: "",
  });

  useEffect(() => {
    if (category) {
      setForm({
        categoryName: category.categoryName || "",
        descriptionCat: category.descriptionCat || "",
      });
    } else {
      setForm({
        categoryName: "",
        descriptionCat: "",
      });
    }
  }, [category]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryName) {
      toast.error("Vui lòng nhập tên loại nguyên liệu!");
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-600 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-green-700">
          {category ? "Cập nhật loại nguyên liệu" : "Thêm loại nguyên liệu"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên loại nguyên liệu
            </label>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="Nhập tên loại nguyên liệu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="descriptionCat"
              value={form.descriptionCat}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              rows="3"
              placeholder="Nhập mô tả..."
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full mt-2"
          >
            {category ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryIngModal;

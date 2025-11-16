// components/admin/PromotionModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const PromotionModal = ({ promotion, onClose, onSaved, stores, products, categories }) => {
  const [form, setForm] = useState({
    PromotionName: "",
    DescriptionPromotion: "",
    StartDate: "",
    EndDate: "",
    DiscountType: "percent",
    DiscountValue: 0,
    MinOrderAmount: 0,
    StoreIDs: [],
    ProductIDs: [],
    CategoryIDs: [],
  });

  useEffect(() => {
    if (promotion) {
      setForm({
        PromotionName: promotion.PromotionName || "",
        DescriptionPromotion: promotion.DescriptionPromotion || "",
        StartDate: promotion.StartDate || "",
        EndDate: promotion.EndDate || "",
        DiscountType: promotion.DiscountType || "percent",
        DiscountValue: promotion.DiscountValue || 0,
        MinOrderAmount: promotion.MinOrderAmount || 0,
        StoreIDs: promotion.Stores?.map(s => String(s.StoreId)) || [],
        ProductIDs: promotion.Products?.map(p => String(p.ProductId)) || [],
        CategoryIDs: promotion.Categories?.map(c => String(c.CategoryId)) || [],
      });
    }
  }, [promotion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const list = form[name];
      setForm({
        ...form,
        [name]: checked ? [...list, value] : list.filter(v => v !== value),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      if (promotion) {
        await axios.put(`http://localhost:5000/api/promotions/${promotion.PromotionId}`, form);
        toast.success("Cập nhật Promotion thành công!");
      } else {
        await axios.post(`http://localhost:5000/api/promotions`, form);
        toast.success("Tạo mới Promotion thành công!");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] shadow-xl p-6 animate-slide-in">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">{promotion ? "Chỉnh sửa Promotion" : "Tạo Promotion"}</h2>

        <div className="space-y-4">
          {/* --- Tên và Mô tả --- */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Tên Promotion</label>
            <input
              type="text"
              placeholder="Nhập tên promotion"
              name="PromotionName"
              value={form.PromotionName}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <label className="font-semibold text-gray-700 mt-2">Mô tả</label>
            <textarea
              placeholder="Mô tả ngắn về promotion"
              name="DescriptionPromotion"
              value={form.DescriptionPromotion}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* --- Ngày bắt đầu và kết thúc --- */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col">
              <label className="font-semibold text-gray-700">Ngày bắt đầu</label>
              <input type="date" name="StartDate" value={form.StartDate} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="font-semibold text-gray-700">Ngày kết thúc</label>
              <input type="date" name="EndDate" value={form.EndDate} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"/>
            </div>
          </div>

          {/* --- Loại giảm và Giá trị --- */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col">
              <label className="font-semibold text-gray-700">Loại giảm</label>
              <select name="DiscountType" value={form.DiscountType} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400">
                <option value="percent">Phần trăm</option>
                <option value="fixed">Cố định</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="font-semibold text-gray-700">Giá trị giảm</label>
              <input type="number" name="DiscountValue" value={form.DiscountValue} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400" placeholder="Nhập giá trị giảm"/>
            </div>
          </div>

          {/* --- Đơn tối thiểu --- */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700">Đơn tối thiểu</label>
            <input type="number" name="MinOrderAmount" value={form.MinOrderAmount} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400" placeholder="Nhập đơn tối thiểu"/>
          </div>

          {/* --- Multi-select --- */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-700 mb-1">Cửa hàng</h4>
              <div className="border border-gray-200 rounded p-2 max-h-32 overflow-y-auto">
                {stores.map(s => (
                  <label key={s.StoreId} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      name="StoreIDs"
                      value={String(s.StoreId)}
                      checked={form.StoreIDs.includes(String(s.StoreId))}
                      onChange={handleChange}
                    />
                    {s.StoreName}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-700 mb-1">Sản phẩm</h4>
              <div className="border border-gray-200 rounded p-2 max-h-32 overflow-y-auto">
                {products.map(p => (
                  <label key={p.ProductId} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      name="ProductIDs"
                      value={String(p.ProductId)}
                      checked={form.ProductIDs.includes(String(p.ProductId))}
                      onChange={handleChange}
                    />
                    {p.ProductName}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-700 mb-1">Danh mục</h4>
              <div className="border border-gray-200 rounded p-2 max-h-32 overflow-y-auto">
                {categories.map(c => (
                  <label key={c.CategoryId} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      name="CategoryIDs"
                      value={String(c.CategoryId)}
                      checked={form.CategoryIDs.includes(String(c.CategoryId))}
                      onChange={handleChange}
                    />
                    {c.CategoryName}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* --- Buttons --- */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Hủy</button>
            <button onClick={handleSubmit} className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{promotion ? "Lưu" : "Tạo"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;

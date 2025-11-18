import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

const PromotionsModal = ({ close, refresh, editData, stores, products, categories }) => {
  const [form, setForm] = useState({
    promotionName: "",
    descriptionPromotion: "",
    startDate: "",
    endDate: "",
    discountType: "percent",
    discountValue: 0,
    minOrderAmount: 0,
    isActive: true,
  });

  const [selectedStoreIDs, setSelectedStoreIDs] = useState([]);
  const [selectedProductIDs, setSelectedProductIDs] = useState([]);
  const [selectedCategoryIDs, setSelectedCategoryIDs] = useState([]);

  useEffect(() => {
    if (editData) {
      setForm({
        promotionName: editData.promotionName || editData.PromotionName || "",
        descriptionPromotion: editData.descriptionPromotion || editData.DescriptionPromotion || "",
        startDate: editData.startDate || editData.StartDate || "",
        endDate: editData.endDate || editData.EndDate || "",
        discountType: editData.discountType || editData.DiscountType || "percent",
        discountValue: editData.discountValue ?? editData.DiscountValue ?? 0,
        minOrderAmount: editData.minOrderAmount ?? editData.MinOrderAmount ?? 0,
        isActive: editData.isActive ?? editData.IsActive ?? true,
      });

      const mapNamesToIds = (namesArray, list, nameKey, idKey) =>
        (namesArray || [])
          .map((nm) => list.find((x) => (x[nameKey] || "").toLowerCase() === (nm || "").toLowerCase())?.[idKey])
          .filter(Boolean);

      setSelectedStoreIDs(mapNamesToIds(editData.Stores || [], stores, "storeName", "storeId"));
      setSelectedProductIDs(mapNamesToIds(editData.Products || [], products, "productName", "productId"));
      setSelectedCategoryIDs(mapNamesToIds(editData.Categories || [], categories, "categoryName", "categoryId"));
    } else {
      setForm({
        promotionName: "",
        descriptionPromotion: "",
        startDate: "",
        endDate: "",
        discountType: "percent",
        discountValue: 0,
        minOrderAmount: 0,
        isActive: true,
      });
      setSelectedStoreIDs([]);
      setSelectedProductIDs([]);
      setSelectedCategoryIDs([]);
    }
  }, [editData, stores, products, categories]);

  const toggleId = (id, list, setList) =>
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      PromotionName: form.promotionName,
      DescriptionPromotion: form.descriptionPromotion,
      StartDate: form.startDate,
      EndDate: form.endDate,
      DiscountType: form.discountType,
      DiscountValue: Number(form.discountValue || 0),
      MinOrderAmount: Number(form.minOrderAmount || 0),
      IsActive: form.isActive,
      StoreIDs: selectedStoreIDs,
      ProductIDs: selectedProductIDs,
      CategoryIDs: selectedCategoryIDs,
    };

    try {
      if (editData && (editData.promotionId || editData.PromotionId)) {
        const id = editData.promotionId || editData.PromotionId;
        await axios.put(`http://localhost:5000/api/Promotions/${id}`, payload);
        toast.success("Cập nhật promotion thành công!");
        refresh({ promotionId: id });
      } else {
        const res = await axios.post("http://localhost:5000/api/Promotions", payload);
        toast.success("Tạo promotion thành công!");
        refresh(res.data);
      }
      close();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại!");
    }
  };

  const renderCheckboxGroup = (label, list, idKey, nameKey, selectedList, setSelectedList) => (
    <div className="mb-4">
      <h3 className="font-extrabold text-xl text-gray-800 mb-2">{label}</h3>
      <div className="max-h-52 overflow-y-auto border rounded-xl p-3 mt-2 bg-gray-50 shadow-inner grid grid-cols-1 gap-2">
        {list.map((it) => {
          const isSelected = selectedList.includes(it[idKey]);
          return (
            <label
              key={it[idKey]}
              className={`flex items-center gap-3 p-2 border rounded-lg bg-white hover:bg-orange-50 cursor-pointer transition-all shadow-sm ${
                isSelected ? "bg-orange-50 border-orange-400" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="h-4 w-4 accent-orange-500"
                onClick={() => toggleId(it[idKey], selectedList, setSelectedList)}
              />
              <span className="text-gray-800">{it[nameKey]}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-indigo-500 text-white px-8 py-6 sticky top-0 z-10">
          <h2 className="text-3xl font-bold tracking-wide">{editData ? "Cập nhật Chương Trình Khuyến Mãi" : "Tạo Chương Trình Khuyến Mãi Mới"}</h2>
          <button onClick={close} className="p-2 hover:bg-white/30 rounded-full transition">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="max-h-[75vh] overflow-y-auto px-10 py-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-semibold">Tên chương trình</label>
                <input
                  type="text"
                  value={form.promotionName}
                  onChange={(e) => setForm({ ...form, promotionName: e.target.value })}
                  className="w-full p-3 mt-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="VD: SummerSale"
                  required
                />
              </div>
              <div>
                <label className="text-gray-700 font-semibold">Giá trị giảm</label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  className="w-full p-3 mt-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Ví dụ: 30"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Mô tả</label>
              <textarea
                value={form.descriptionPromotion}
                onChange={(e) => setForm({ ...form, descriptionPromotion: e.target.value })}
                className="w-full p-3 mt-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Mô tả chương trình…"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="font-semibold">Ngày kết thúc</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Loại giảm</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full p-3 mt-2 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (đ)</option>
                  <option value="FreeShipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="font-semibold">Đơn hàng tối thiểu</label>
                <input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                  className="w-full p-3 mt-2 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-10 mt-2">
              <label className="flex items-center gap-3 font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-5 w-5 accent-green-600"
                />
                Active
              </label>
            </div>

            {/* Checkbox groups */}
            {renderCheckboxGroup("Cửa hàng áp dụng", stores, "storeId", "storeName", selectedStoreIDs, setSelectedStoreIDs)}
            {renderCheckboxGroup("Sản phẩm áp dụng", products, "productId", "productName", selectedProductIDs, setSelectedProductIDs)}
            {renderCheckboxGroup("Danh mục áp dụng", categories, "categoryId", "categoryName", selectedCategoryIDs, setSelectedCategoryIDs)}

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              {editData ? "Cập nhật Chương Trình" : "Tạo Chương Trình"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromotionsModal;

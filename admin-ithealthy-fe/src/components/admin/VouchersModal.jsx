import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

const VouchersModal = ({ close, refresh, editData, stores, products, categories }) => {
  const [form, setForm] = useState({
    code: "",
    descriptionVou: "",
    startDate: "",
    expiryDate: "",
    discountType: "percent",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUsage: 0,
    perCustomerLimit: 0,
    isActive: true,
    isStackable: false,
  });

  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  

  useEffect(() => {
    if (editData) {
      setForm({
        code: editData.code || "",
        descriptionVou: editData.descriptionVou || "",
        startDate: editData.startDate || "",
        expiryDate: editData.expiryDate || "",
        discountType: editData.discountType || "percent",
        discountValue: editData.discountValue || 0,
        minOrderAmount: editData.minOrderAmount || 0,
        maxDiscountAmount: editData.maxDiscountAmount || 0,
        maxUsage: editData.maxUsage || 0,
        perCustomerLimit: editData.perCustomerLimit || 0,
        isActive: editData.isActive ?? true,
        isStackable: editData.isStackable ?? false,
      });
      setSelectedStores(editData.stores || []);
      setSelectedProducts(editData.products || []);
      setSelectedCategories(editData.categories || []);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      StoreIDs: selectedStores.map((s) => s.storeId),
      ProductIDs: selectedProducts.map((p) => p.productId),
      CategoryIDs: selectedCategories.map((c) => c.categoryId),
    };

    try {
      if (editData) {
        await axios.put(`http://localhost:5000/api/vouchers/${editData.voucherId}`, payload);
        toast.success("Cập nhật voucher thành công!");
        refresh({
          ...editData,
          ...payload,
          stores: selectedStores,
          products: selectedProducts,
          categories: selectedCategories,
        });
      } else {
        const res = await axios.post("http://localhost:5000/api/vouchers", payload);
        toast.success("Tạo voucher thành công!");
        refresh({
          ...res.data,
          stores: selectedStores,
          products: selectedProducts,
          categories: selectedCategories,
        });
      }
      close();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại!");
    }
  };

  const toggleSelection = (item, list, setList, idKey = "id") => {
    const exists = list.find((i) => i[idKey] === item[idKey]);
    if (exists) setList(list.filter((i) => i[idKey] !== item[idKey]));
    else setList([...list, item]);
  };

  const renderCheckboxGroup = (label, options, selectedList, setList, idKey, nameKey) => (
  <div className="mb-6">
    <h3 className="font-extrabold text-xl text-black-600 mb-3">{label}</h3>

    <div className="max-h-52 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 border rounded-xl bg-gray-50 shadow-inner">
      {options.map((opt) => {
        const isSelected = selectedList.some((s) => s[idKey] === opt[idKey]);
        return (
          <div
            key={opt[idKey]}
            className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all 
                        ${isSelected ? "bg-orange-50 border-orange-400 shadow-md" : "bg-white hover:bg-orange-50"}`}
            onClick={() => toggleSelection(opt, selectedList, setList, idKey)}
          >
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="h-4 w-4 accent-orange-500"
            />
            <span className="text-gray-800 text-sm font-medium">{opt[nameKey]}</span>
          </div>
        );
      })}
    </div>
  </div>
);


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div
          className="
            p-6
            bg-white 
            text-gray-800
            rounded-t-3xl
            flex justify-between items-center
            shadow-md
            border-b
          "
        >
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            {editData ? "Cập nhật Voucher" : "Tạo Voucher Mới"}
          </h2>

          <button
            onClick={close}
            className="text-gray-700 hover:text-black transition"
          >
            <FaTimes className="w-7 h-7" />
          </button>
        </div>



        {/* Nội dung cuộn */}
        <div className="max-h-[75vh] overflow-y-auto px-10 py-8 space-y-6">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mã & mô tả */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-semibold">Mã voucher</label>
                <input
                  type="text"
                  disabled={!!editData}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full p-3 mt-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="VD: SALE50"
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
                value={form.descriptionVou}
                onChange={(e) => setForm({ ...form, descriptionVou: e.target.value })}
                className="w-full p-3 mt-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Mô tả voucher…"
              />
            </div>

            {/* Ngày */}
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
                <label className="font-semibold">Ngày hết hạn</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
            </div>

            {/* Loại giảm */}
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

            {/* Giới hạn & checkbox */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Giảm tối đa</label>
                <input
                  type="number"
                  value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
                  className="w-full p-3 mt-2 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="font-semibold">Số lần dùng tối đa</label>
                <input
                  type="number"
                  value={form.maxUsage}
                  onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })}
                  className="w-full p-3 mt-2 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
            </div>

  
            {/* Giới hạn mỗi khách */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Giới hạn mỗi khách (perCustomerLimit)</label>
                <input
                  type="number"
                  value={form.perCustomerLimit}
                  onChange={(e) => setForm({ ...form, perCustomerLimit: Number(e.target.value) })}
                  className="w-full p-3 mt-2 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="VD: 1"
                />
              </div>
            </div>


            {/* Trạng thái */}
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

              <label className="flex items-center gap-3 font-medium">
                <input
                  type="checkbox"
                  checked={form.isStackable}
                  onChange={(e) => setForm({ ...form, isStackable: e.target.checked })}
                  className="h-5 w-5 accent-purple-600"
                />
                Stackable
              </label>
            </div>

            {/* Checkbox groups */}
            {renderCheckboxGroup("Cửa hàng áp dụng", stores, selectedStores, setSelectedStores, "storeId", "storeName")}
            {renderCheckboxGroup("Sản phẩm áp dụng", products, selectedProducts, setSelectedProducts, "productId", "productName")}
            {renderCheckboxGroup("Danh mục áp dụng", categories, selectedCategories, setSelectedCategories, "categoryId", "categoryName")}

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              {editData ? "Cập nhật Voucher" : "Tạo Voucher"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default VouchersModal;

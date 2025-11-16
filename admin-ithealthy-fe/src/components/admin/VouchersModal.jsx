// components/admin/VouchersModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const VouchersModal = ({ voucher, onClose, onSaved, stores: propStores = [], products: propProducts = [], categories: propCategories = [] }) => {
  const [formData, setFormData] = useState({
    code: "",
    descriptionVou: "",
    startDate: "",
    expiryDate: "",
    discountType: "percent",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUsage: 0,
    perCustomerLimit: 1,
    isActive: true,
    isStackable: false,
    storeIDs: [],
    productIDs: [],
    categoryIDs: []
  });

  const [stores, setStores] = useState(propStores);
  const [products, setProducts] = useState(propProducts);
  const [categories, setCategories] = useState(propCategories);
  const [loading, setLoading] = useState(false);

  // Load voucher data
  useEffect(() => {
    setStores(propStores);
    setProducts(propProducts);
    setCategories(propCategories);

    if (voucher) {
      setFormData({
        code: voucher.code || "",
        descriptionVou: voucher.descriptionVou || "",
        startDate: voucher.startDate || "",
        expiryDate: voucher.expiryDate || "",
        discountType: voucher.discountType || "percent",
        discountValue: voucher.discountValue || 0,
        minOrderAmount: voucher.minOrderAmount || 0,
        maxDiscountAmount: voucher.maxDiscountAmount || 0,
        maxUsage: voucher.maxUsage || 0,
        perCustomerLimit: voucher.perCustomerLimit || 1,
        isActive: voucher.isActive ?? true,
        isStackable: voucher.isStackable ?? false,
        storeIDs: voucher.storeIDs || [],
        productIDs: voucher.productIDs || [],
        categoryIDs: voucher.categoryIDs || []
      });
    }
  }, [voucher, propStores, propProducts, propCategories]);

  // Handle input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (voucher) {
        await axios.put(`http://localhost:5000/api/vouchers/${voucher.voucherId}`, payload);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await axios.post("http://localhost:5000/api/vouchers", payload);
        toast.success("Tạo voucher thành công!");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, kiểm tra console");
    } finally {
      setLoading(false);
    }
  };

  // Add/remove multi-select
  const addToMultiSelect = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], id]
    }));
  };

  const removeFromMultiSelect = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== id)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl overflow-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">{voucher ? "Sửa Voucher" : "Tạo Voucher"}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Mô tả</label>
              <input type="text" name="descriptionVou" value={formData.descriptionVou} onChange={handleChange}
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Thời gian áp dụng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Ngày bắt đầu</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Ngày kết thúc</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Loại giảm giá */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Loại giảm</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="percent">%</option>
                <option value="amount">Amount</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Giá trị giảm</label>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Đơn tối thiểu</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange}
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Giới hạn & Switch */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Max giảm</label>
              <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange}
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Max sử dụng</label>
              <input type="number" name="maxUsage" value={formData.maxUsage} onChange={handleChange}
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex items-center space-x-6 mt-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 accent-blue-500" />
                <span className="text-gray-700 font-medium">Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="isStackable" checked={formData.isStackable} onChange={handleChange} className="w-5 h-5 accent-blue-500" />
                <span className="text-gray-700 font-medium">Stackable</span>
              </label>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-1 font-medium">Giới hạn KH</label>
              <input type="number" name="perCustomerLimit" value={formData.perCustomerLimit} onChange={handleChange}
                     className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Multi-select */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/** Cửa hàng **/}
            <MultiSelect label="Cửa hàng" field="storeIDs" options={stores} selectedIDs={formData.storeIDs} setSelectedIDs={ids => setFormData(prev => ({...prev, storeIDs: ids}))} displayKey="storeName" />
            {/** Sản phẩm **/}
            <MultiSelect label="Sản phẩm" field="productIDs" options={products} selectedIDs={formData.productIDs} setSelectedIDs={ids => setFormData(prev => ({...prev, productIDs: ids}))} displayKey="productName" />
            {/** Danh mục **/}
            <MultiSelect label="Danh mục" field="categoryIDs" options={categories} selectedIDs={formData.categoryIDs} setSelectedIDs={ids => setFormData(prev => ({...prev, categoryIDs: ids}))} displayKey="categoryName" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">Hủy</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              {loading ? "Đang xử lý..." : voucher ? "Cập nhật" : "Tạo"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// MultiSelect Component
const MultiSelect = ({ label, field, options, selectedIDs, setSelectedIDs, displayKey }) => {
  const add = id => {
    if (!selectedIDs.includes(id)) setSelectedIDs([...selectedIDs, id]);
  };
  const remove = id => setSelectedIDs(selectedIDs.filter(i => i !== id));

  return (
    <div className="flex flex-col">
      <label className="text-gray-600 mb-1 font-medium">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIDs.map(id => {
          const item = options.find(o => o[`${field.replace("IDs","Id")}`] === id);
          if (!item) return null;
          return (
            <span key={id} className={`px-2 py-1 rounded-full flex items-center space-x-1 bg-${label==='Cửa hàng'?'blue':'Sản phẩm'?'green':'purple'}-100 text-${label==='Cửa hàng'?'blue':'Sản phẩm'?'green':'purple'}-800`}>
              <span>{item[displayKey]}</span>
              <button type="button" onClick={() => remove(id)} className="font-bold">×</button>
            </span>
          );
        })}
      </div>
      <select value="" onChange={e => { const val = parseInt(e.target.value); if (val) add(val); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="" disabled>Chọn {label}</option>
        {options.map(o => <option key={o[`${field.replace("IDs","Id")}`]} value={o[`${field.replace("IDs","Id")}`]}>{o[displayKey]}</option>)}
      </select>
    </div>
  );
};

export default VouchersModal;

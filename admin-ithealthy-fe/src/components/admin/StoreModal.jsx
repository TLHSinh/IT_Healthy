import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { toast } from "react-toastify"; // ✅ dùng react-toastify thay vì react-hot-toast
import { XCircle } from "lucide-react";

const StoreModal = ({ isOpen, setIsOpen, store, refreshList }) => {
  const [form, setForm] = useState({
    storeName: "",
    phone: "",
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    country: "Việt Nam",
    postcode: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  // ✅ Reset form khi đóng modal
  const resetForm = () => {
    setForm({
      storeName: "",
      phone: "",
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      country: "Việt Nam",
      postcode: "",
      latitude: "",
      longitude: "",
      isActive: true,
    });
  };

  // ✅ Cập nhật form khi mở modal
  useEffect(() => {
    if (store) {
      setForm({
        storeName: store.storeName || "",
        phone: store.phone || "",
        streetAddress: store.streetAddress || "",
        ward: store.ward || "",
        district: store.district || "",
        city: store.city || "",
        country: store.country || "Việt Nam",
        postcode: store.postcode || "",
        latitude: store.latitude || "",
        longitude: store.longitude || "",
        isActive: store.isActive ?? true,
      });
    } else {
      resetForm();
    }
  }, [store]);

  // ✅ Bắt sự kiện thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.storeName || !form.phone || !form.streetAddress) {
      toast.warning("⚠️ Vui lòng nhập đầy đủ tên, SĐT và địa chỉ cửa hàng.");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...form,
        dateJoined: new Date().toISOString().split("T")[0],
      };

      if (store) {
        const storeId = store?.storeId ?? store?.StoreId;
        if (!storeId) throw new Error("Không tìm thấy ID cửa hàng để cập nhật!");

        await adminApi.updateStore(storeId, dataToSend);
        toast.success("Cập nhật cửa hàng thành công!");
      } else {
        await adminApi.createStore(dataToSend);
        toast.success("Thêm cửa hàng mới thành công!");
      }

      // ⏳ Delay nhẹ để toast hiển thị trước khi đóng modal
      setTimeout(() => {
        refreshList();
        resetForm();
        setIsOpen(false);
      }, 0);
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      toast.error(err.message || "Lưu thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative animate-slideUp border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {store ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng mới"}
          </h3>
          <button
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {[
            { name: "storeName", placeholder: "Tên cửa hàng", required: true },
            { name: "phone", placeholder: "Số điện thoại", required: true },
            {
              name: "streetAddress",
              placeholder: "Địa chỉ",
              required: true,
              colSpan: 2,
            },
            { name: "ward", placeholder: "Phường/Xã" },
            { name: "district", placeholder: "Quận/Huyện" },
            { name: "city", placeholder: "Thành phố" },
            { name: "country", placeholder: "Quốc gia" },
            { name: "postcode", placeholder: "Mã bưu điện" },
            { name: "latitude", placeholder: "Vĩ độ (Latitude)" },
            { name: "longitude", placeholder: "Kinh độ (Longitude)" },
          ].map((f) => (
            <input
              key={f.name}
              name={f.name}
              placeholder={f.placeholder}
              value={form[f.name]}
              onChange={handleChange}
              required={f.required}
              disabled={loading}
              className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none ${
                f.colSpan === 2 ? "col-span-2" : ""
              }`}
            />
          ))}

          {/* Checkbox */}
          <label className="flex items-center gap-2 mt-2 col-span-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-indigo-600"
              disabled={loading}
            />
            <span className="text-gray-700 text-sm">Hoạt động</span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5 col-span-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading
                ? "Đang lưu..."
                : store
                ? "Lưu thay đổi"
                : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreModal;

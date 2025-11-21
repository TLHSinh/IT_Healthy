
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddressModal({
  user,
  addresses,
  setAddresses,
  selectedAddress,
  setSelectedAddress,
  isOpen,
  onClose,
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load danh sách tỉnh khi mở modal
  useEffect(() => {
    if (isOpen) {
      axios.get("https://provinces.open-api.vn/api/p/").then(res => {
        setProvinces(res.data || []);
      });
    }
  }, [isOpen]);

  // Khi mở form sửa → tự động load quận + phường từ tên tỉnh đã lưu
  useEffect(() => {
    if (isFormOpen && editingAddress?.city && provinces.length > 0) {
      const foundProvince = provinces.find(p => p.name === editingAddress.city);
      if (foundProvince) {
        axios
          .get(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`)
          .then(res => {
            setDistricts(res.data.districts);

            // Nếu có tên quận → load phường
            if (editingAddress.district) {
              const foundDistrict = res.data.districts.find(
                d => d.name === editingAddress.district
              );
              if (foundDistrict) {
                axios
                  .get(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`)
                  .then(res2 => setWards(res2.data.wards));
              }
            }
          });
      }
    }
  }, [editingAddress, isFormOpen, provinces]);

  if (!isOpen) return null;

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    const selectedProvince = provinces.find(p => p.name === provinceName);

    setEditingAddress({
      ...editingAddress,
      city: provinceName,
      district: "",
      ward: "",
    });

    if (selectedProvince) {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`
      );
      setDistricts(res.data.districts);
      setWards([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    const selectedDistrict = districts.find(d => d.name === districtName);

    setEditingAddress({
      ...editingAddress,
      district: districtName,
      ward: "",
    });

    if (selectedDistrict) {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
      );
      setWards(res.data.wards);
    }
  };

  const handleWardChange = (e) => {
    setEditingAddress({
      ...editingAddress,
      ward: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingAddress,
        CustomerId: user.customerId,
      };

      let res;
      if (editingAddress.addressId) {
        res = await axios.put(
          `http://localhost:5000/api/customeraddresses/update/${editingAddress.addressId}`,
          payload
        );
        toast.success("Cập nhật địa chỉ thành công!");
      } else {
        res = await axios.post(
          "http://localhost:5000/api/customeraddresses/add",
          payload
        );
        toast.success("Thêm địa chỉ thành công!");
      }

      const list = await axios.get(
        `http://localhost:5000/api/customeraddresses/by-customer/${user.customerId}`
      );
      setAddresses(list.data || []);
      setSelectedAddress(res.data.data.address);
      setIsFormOpen(false);
      setDistricts([]);
      setWards([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu địa chỉ.");
    }
  };
if (!isOpen) return null;




const handleDelete = async (addressId) => {
  try {
    await axios.delete(`http://localhost:5000/api/customeraddresses/delete/${addressId}`);
    toast.success("Xóa địa chỉ thành công!");

    // Refresh danh sách
    const list = await axios.get(
      `http://localhost:5000/api/customeraddresses/by-customer/${user.customerId}`
    );
    setAddresses(list.data || []);

    // Nếu địa chỉ đang chọn bị xóa → bỏ chọn
    if (selectedAddress?.addressId === addressId) {
      setSelectedAddress(null);
    }

    setDeletingId(null);
  } catch (err) {
    toast.error(err.response?.data?.message || "Không thể xóa địa chỉ");
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        onClick={onClose}
      />

      {/* Modal Container - đẹp lung linh */}
      <div
        className={`relative w-full max-w-lg transform transition-all duration-300 ease-out 
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5">
            <h2 className="text-xl font-bold text-center">
              {isFormOpen
                ? editingAddress?.addressId
                  ? "Cập nhật địa chỉ"
                  : "Thêm địa chỉ mới"
                : "Chọn địa chỉ giao hàng"}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Danh sách địa chỉ */}
            {!isFormOpen && (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${addr.addressId === selectedAddress?.addressId
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-green-400 hover:shadow-md"
                      }`}
                    onClick={() => {
                      setSelectedAddress(addr);
                      onClose();
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{addr.receiverName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                        <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                        {addr.isDefault && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(addr);
                            setIsFormOpen(true);
                          }}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(addr.addressId);
                          }}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setEditingAddress({
                      receiverName: "",
                      phoneNumber: "",
                      streetAddress: "",
                      city: "",
                      district: "",
                      ward: "",
                      isDefault: false,
                    });
                    setDistricts([]);
                    setWards([]);
                    setIsFormOpen(true);
                  }}
                  className="w-full mt-4 border-2 border-dashed border-green-500 text-green-600 py-4 rounded-xl font-medium hover:bg-green-50 transition"
                >
                  + Thêm địa chỉ mới
                </button>
              </div>
            )}

            {/* Form thêm/sửa */}
            {isFormOpen && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Các input như cũ nhưng đẹp hơn */}
                <input
                  type="text"
                  placeholder="Họ và tên người nhận"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.receiverName || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, receiverName: e.target.value })}
                  required
                />

                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.phoneNumber || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, phoneNumber: e.target.value })}
                  required
                />

                <input
                  type="text"
                  placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.streetAddress || ""}
                  onChange={(e) => setEditingAddress({ ...editingAddress, streetAddress: e.target.value })}
                  required
                />

                {/* Select tỉnh */}
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.city || ""}
                  onChange={handleProvinceChange}
                  required
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>

                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.district || ""}
                  onChange={handleDistrictChange}
                  disabled={!districts.length}
                  required
                >
                  <option value="">-- Chọn Quận / Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={editingAddress?.ward || ""}
                  onChange={handleWardChange}
                  disabled={!wards.length}
                  required
                >
                  <option value="">-- Chọn Phường / Xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAddress?.isDefault || false}
                    onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">Đặt làm địa chỉ mặc định</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
                  >
                    {editingAddress?.addressId ? "Cập nhật" : "Thêm địa chỉ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setDistricts([]);
                      setWards([]);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>


      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform scale-100 transition">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xóa địa chỉ này?</h3>
              <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition"
              >
                Xóa vĩnh viễn
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
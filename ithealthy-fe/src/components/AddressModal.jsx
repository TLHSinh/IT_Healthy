import React, { useState } from "react";
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  if (!isOpen) return null;

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
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi lưu địa chỉ.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl relative">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isFormOpen
            ? editingAddress?.addressId
              ? "Cập nhật địa chỉ"
              : "Thêm địa chỉ mới"
            : "Chọn địa chỉ giao hàng"}
        </h2>

        {/* Danh sách địa chỉ */}
        {!isFormOpen && (
          <>
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-4">
              {addresses.map((addr) => (
                <div
                  key={addr.addressId}
                  className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center transition-all ${
                    addr.addressId === selectedAddress?.addressId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-400 hover:bg-green-50"
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedAddress(addr);
                      onClose();
                    }}
                    className="flex-1"
                  >
                    <p className="font-semibold text-gray-800">
                      {addr.receiverName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.streetAddress}, {addr.ward}, {addr.district},{" "}
                      {addr.city}
                    </p>
                    <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                    {addr.isDefault && (
                      <span className="text-xs text-green-600 font-medium">
                        (Mặc định)
                      </span>
                    )}
                  </div>
                  <button
                    className="text-blue-500 text-sm font-medium hover:underline ml-2"
                    onClick={() => {
                      setEditingAddress(addr);
                      setIsFormOpen(true);
                    }}
                  >
                    Sửa
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-full bg-green-500 py-2 rounded-lg text-white hover:bg-green-600 mb-2 transition"
              onClick={() => {
                setEditingAddress({
                  receiverName: "",
                  phoneNumber: "",
                  streetAddress: "",
                  ward: "",
                  district: "",
                  city: "",
                  isDefault: false,
                });
                setIsFormOpen(true);
              }}
            >
              + Thêm địa chỉ mới
            </button>

            <button
              onClick={onClose}
              className="mt-2 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Đóng
            </button>
          </>
        )}

        {/* Form thêm/sửa địa chỉ */}
        {isFormOpen && (
          <form
            className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg mb-4"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Tên người nhận"
              className="border p-2 rounded"
              value={editingAddress?.receiverName || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  receiverName: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              className="border p-2 rounded"
              value={editingAddress?.phoneNumber || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  phoneNumber: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              className="border p-2 rounded"
              value={editingAddress?.streetAddress || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  streetAddress: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Phường / Xã"
              className="border p-2 rounded"
              value={editingAddress?.ward || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  ward: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Quận / Huyện"
              className="border p-2 rounded"
              value={editingAddress?.district || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  district: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Thành phố / Tỉnh"
              className="border p-2 rounded"
              value={editingAddress?.city || ""}
              onChange={(e) =>
                setEditingAddress({
                  ...editingAddress,
                  city: e.target.value,
                })
              }
            />
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={editingAddress?.isDefault || false}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    isDefault: e.target.checked,
                  })
                }
              />
              <label className="text-sm text-gray-700">Đặt làm mặc định</label>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 py-2 rounded text-white hover:bg-blue-600 transition"
              >
                Lưu địa chỉ
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

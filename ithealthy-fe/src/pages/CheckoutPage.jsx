import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, shipping } = location.state || {};
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // bật form thêm/sửa
  const [editingAddress, setEditingAddress] = useState(null); // địa chỉ đang sửa

  useEffect(() => {
    if (!user) return;
    axios
      .get(
        `http://localhost:5000/api/customeraddresses/by-customer/${user.customerId}`
      )
      .then((res) => {
        setAddresses(res.data || []);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddress(defaultAddr);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Không tải được danh sách địa chỉ.");
      });
  }, [user]);

  if (!cart) {
    navigate("/cart");
    return null;
  }

  const shippingCost =
    shipping === "express"
      ? 15000
      : shipping === "pickup"
      ? cart.totalPrice * 0.21
      : 0;

  const totalPrice = cart.totalPrice + shippingCost;

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    const requestPayload = {
      CustomerId: user.customerId,
      StoreId: 1,
      AddressId: selectedAddress.addressId,
      VoucherId: null,
      PromotionId: null,
      Discount: 0,
      Items: cart.items.map((item) => ({
        ProductId: item.productId,
        ComboId: item.comboId,
        BowlId: item.bowlId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
      })),
    };

    toast.promise(
      axios.post("http://localhost:5000/api/Checkout", requestPayload),
      {
        loading: "Đang xử lý đơn hàng...",
        success: (res) => {
          navigate("/OrderSuccess", { state: { orderId: res.data.orderId } });
          return `Đặt hàng thành công! Mã đơn hàng: ${res.data.orderId}`;
        },
        error: (err) =>
          `Thanh toán thất bại: ${err.response?.data || err.message}`,
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen pt-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product List */}
        <div className="flex-1 flex flex-col gap-4">
          {cart.items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-2xl p-4 shadow"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={
                      item.imageProduct ||
                      "https://soumaki.com.vn/wp-content/uploads/2024/03/default-banner.png"
                    }
                    alt={item.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.productName}
                  </h3>
                  {item.comboName && (
                    <p className="text-sm text-gray-500">
                      Combo: {item.comboName}
                    </p>
                  )}
                  {item.bowlName && (
                    <p className="text-sm text-gray-500">
                      Bowl: {item.bowlName}
                    </p>
                  )}
                  <p className="text-red-500 font-bold mt-1">
                    {item.unitPrice?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 text-lg font-semibold text-gray-800">
                {item.subTotal?.toLocaleString("vi-VN")}₫
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Địa chỉ giao hàng</h2>
          {selectedAddress ? (
            <div
              className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200"
              onClick={() => setIsAddressModalOpen(true)}
            >
              <p className="font-semibold">{selectedAddress.receiverName}</p>
              <p className="text-sm">
                {selectedAddress.streetAddress}, {selectedAddress.ward},{" "}
                {selectedAddress.district}, {selectedAddress.city}
              </p>
              <p className="text-sm">{selectedAddress.phoneNumber}</p>
            </div>
          ) : (
            <p>Đang tải địa chỉ...</p>
          )}

          <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>Subtotal</span>
            <span>{cart.totalPrice?.toLocaleString("vi-VN")}₫</span>
          </div>

          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>Shipping</span>
            <span>
              {shippingCost.toLocaleString("vi-VN")}₫ ({shipping})
            </span>
          </div>

          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total</span>
            <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition"
          >
            Xác nhận đặt hàng
          </button>
        </div>
      </div>
      // Phần modal bên dưới CheckoutPage
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Chọn địa chỉ giao hàng
            </h2>

            {/* Danh sách địa chỉ */}
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-4">
              {addresses.map((addr) => (
                <div
                  key={addr.addressId}
                  className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center ${
                    addr.addressId === selectedAddress?.addressId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedAddress(addr);
                      setIsAddressModalOpen(false);
                    }}
                  >
                    <p className="font-semibold">{addr.receiverName}</p>
                    <p className="text-sm">
                      {addr.streetAddress}, {addr.ward}, {addr.district},{" "}
                      {addr.city}
                    </p>
                    <p className="text-sm">{addr.phoneNumber}</p>
                  </div>
                  <button
                    className="text-blue-500 text-sm"
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

            {/* Thêm địa chỉ mới */}
            <button
              className="w-full bg-green-500 py-2 rounded-lg text-white hover:bg-green-600 mb-4"
              onClick={() => {
                setEditingAddress(null);
                setIsFormOpen(true);
              }}
            >
              Thêm địa chỉ mới
            </button>

            {/* Form thêm/cập nhật địa chỉ */}
            {isFormOpen && (
              <form
                className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const payload = {
                      ...editingAddress,
                      CustomerId: user.customerId,
                    };
                    let res;
                    if (editingAddress?.addressId) {
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
                    // Refresh danh sách địa chỉ
                    const list = await axios.get(
                      `http://localhost:5000/api/customeraddresses/by-customer/${user.customerId}`
                    );
                    setAddresses(list.data || []);
                    setSelectedAddress(res.data.data.address); // chọn địa chỉ mới/cập nhật
                    setIsFormOpen(false);
                  } catch (err) {
                    console.error(err);
                    toast.error(
                      err.response?.data?.message || "Lỗi lưu địa chỉ."
                    );
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Tên người nhận"
                  className="border p-2 rounded"
                  value={editingAddress?.ReceiverName || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      ReceiverName: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="border p-2 rounded"
                  value={editingAddress?.PhoneNumber || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      PhoneNumber: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  className="border p-2 rounded"
                  value={editingAddress?.StreetAddress || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      StreetAddress: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Phường / Xã"
                  className="border p-2 rounded"
                  value={editingAddress?.Ward || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      Ward: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Quận / Huyện"
                  className="border p-2 rounded"
                  value={editingAddress?.District || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      District: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Thành phố / Tỉnh"
                  className="border p-2 rounded"
                  value={editingAddress?.City || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      City: e.target.value,
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingAddress?.IsDefault || false}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        IsDefault: e.target.checked,
                      })
                    }
                  />
                  <label>Đặt làm mặc định</label>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 py-2 rounded text-white hover:bg-blue-600"
                >
                  Lưu địa chỉ
                </button>
              </form>
            )}

            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="mt-2 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

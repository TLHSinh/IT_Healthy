import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, shipping } = location.state || {};
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

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

    const requestPayload = {
      CustomerId: user.customerId,
      StoreId: 1, // điều chỉnh store theo logic của bạn
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

    // Dùng toast.promise để hiển thị trạng thái
    toast.promise(
      axios.post("http://localhost:5000/api/Checkout", requestPayload),
      {
        loading: "Đang xử lý đơn hàng...",
        success: (res) => {
          // Chuyển hướng khi thành công
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
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow">
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
    </div>
  );
}

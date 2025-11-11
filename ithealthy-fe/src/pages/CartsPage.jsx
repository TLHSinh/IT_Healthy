import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CartPage() {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState("free");
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cart/user/${user.customerId}`
      );
      setCart(res.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải giỏ hàng.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleCheckout = () => {
    // Bạn có thể truyền dữ liệu cart qua state nếu cần
    navigate("/checkout", { state: { cart, shipping } });
  };

  const handleUpdateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        customerId: user.customerId,
        productId: item.productId,
        comboId: item.comboId,
        bowlId: item.bowlId,
        quantity: delta,
        unitPrice: item.unitPrice,
      });
      fetchCart();
    } catch (err) {
      toast.error("Không thể cập nhật số lượng.");
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/cart/remove/${item.cartItemId}`
      );
      fetchCart();
    } catch (err) {
      toast.error("Không thể xóa sản phẩm.");
    }
  };

  if (!user)
    return (
      <p className="text-center mt-10">Vui lòng đăng nhập để xem giỏ hàng.</p>
    );
  if (loading) return <p className="text-center mt-10">Đang tải giỏ hàng...</p>;
  if (!cart || cart.items.length === 0)
    return <p className="text-center mt-10">Giỏ hàng trống.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen pt-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ Hàng</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product List */}
        <div className="flex-1 flex flex-col gap-4">
          {cart.items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-2xl p-4 shadow hover:shadow-lg transition"
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

              <div className="flex items-center mt-4 sm:mt-0 gap-2">
                <button
                  onClick={() => handleUpdateQuantity(item, -1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item, 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="ml-4 text-red-500 font-semibold hover:text-red-700"
                >
                  Xóa
                </button>
              </div>

              <div className="mt-4 sm:mt-0 text-lg font-semibold text-gray-800">
                {item.subTotal?.toLocaleString("vi-VN")}₫
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt giỏ hàng</h2>

          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping"
                value="free"
                checked={shipping === "free"}
                onChange={() => setShipping("free")}
              />
              Free shipping ($0)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shipping === "express"}
                onChange={() => setShipping("express")}
              />
              Express shipping (+$15)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping"
                value="pickup"
                checked={shipping === "pickup"}
                onChange={() => setShipping("pickup")}
              />
              Pick Up (%21)
            </label>
          </div>

          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>Subtotal</span>
            <span>{cart.totalPrice?.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total</span>
            <span>
              {(
                cart.totalPrice +
                (shipping === "express" ? 15000 : 0) +
                (shipping === "pickup" ? cart.totalPrice * 0.21 : 0)
              ).toLocaleString("vi-VN")}
              ₫
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
          >
            Thanh Toán
          </button>
        </div>
      </div>
    </div>
  );
}

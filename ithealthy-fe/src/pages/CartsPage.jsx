import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  Tag,
  Truck,
  Store,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const SHIPPING_OPTIONS = {
  standard: { label: "Giao hàng tiêu chuẩn", cost: 0, icon: Truck },
  express: { label: "Giao hàng nhanh (1-2 ngày)", cost: 15000, icon: Truck },
  pickup: { label: "Nhận tại cửa hàng", cost: 0, icon: Store },
};

export default function CartPage() {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [shipping, setShipping] = useState("standard");
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/cart/user/${user.customerId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setCart(res.data);

      // 🔥 Lưu cartId vào localStorage
      if (res.data && res.data.cartId) {
        localStorage.setItem("cartId", res.data.cartId);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải giỏ hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleUpdateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    setUpdatingItems((prev) => ({ ...prev, [item.cartItemId]: true }));

    try {
      await axios.post(
        `${API_BASE_URL}/cart/add`,
        {
          customerId: user.customerId,
          productId: item.productId,
          comboId: item.comboId,
          bowlId: item.bowlId,
          quantity: delta,
          unitPrice: item.unitPrice,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Optimistic update
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.cartItemId === item.cartItemId
            ? { ...i, quantity: newQty, subTotal: newQty * i.unitPrice }
            : i
        ),
        totalPrice: prev.totalPrice + delta * item.unitPrice,
      }));

      toast.success("Đã cập nhật số lượng");
    } catch (err) {
      toast.error("Không thể cập nhật số lượng.");
      fetchCart(); // Revert on error
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item.cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (item) => {
    if (!window.confirm(`Xóa "${item.productName}" khỏi giỏ hàng?`)) return;

    setUpdatingItems((prev) => ({ ...prev, [item.cartItemId]: true }));

    try {
      await axios.delete(`${API_BASE_URL}/cart/remove/${item.cartItemId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.cartItemId !== item.cartItemId),
        totalPrice: prev.totalPrice - item.subTotal,
      }));

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err) {
      toast.error("Không thể xóa sản phẩm.");
      fetchCart();
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item.cartItemId]: false }));
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucher.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setApplyingVoucher(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/voucher/validate`,
        {
          code: voucher,
          customerId: user.customerId,
          totalAmount: cart.totalPrice,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setDiscount(res.data.discountAmount);
      toast.success(
        `Áp dụng mã giảm giá thành công! Giảm ${res.data.discountAmount.toLocaleString(
          "vi-VN"
        )}₫`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setDiscount(0);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    navigate("/checkout", {
      state: {
        cart,
        shipping,
        shippingCost: SHIPPING_OPTIONS[shipping].cost,
        discount,
        voucher: discount > 0 ? voucher : null,
      },
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <ShoppingCart className="w-24 h-24 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 mb-4">
          Vui lòng đăng nhập để xem giỏ hàng
        </p>
        <button
          onClick={() => navigate("/login-user")}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <ShoppingCart className="w-24 h-24 text-gray-300 mb-4" />
        <p className="text-xl text-gray-600 mb-4">
          Giỏ hàng của bạn đang trống
        </p>
        <button
          onClick={() => navigate("/signature-bowls")}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  const shippingCost = SHIPPING_OPTIONS[shipping].cost;
  const subtotal = cart.totalPrice;
  const total = subtotal + shippingCost - discount;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ Hàng</h1>
        <p className="text-gray-600">{cart.items.length} sản phẩm</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Product List */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={
                      item.imageProduct ||
                      "https://soumaki.com.vn/wp-content/uploads/2024/03/default-banner.png"
                    }
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {item.productName}
                  </h3>

                  {item.descriptionProduct && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {item.descriptionProduct}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.comboName && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        Combo: {item.comboName}
                      </span>
                    )}
                    {item.bowlName && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
                        Bowl: {item.bowlName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-green-600">
                        {item.unitPrice?.toLocaleString("vi-VN")}₫
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item, -1)}
                          disabled={
                            updatingItems[item.cartItemId] || item.quantity <= 1
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-10 text-center font-semibold">
                          {updatingItems[item.cartItemId] ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          onClick={() => handleUpdateQuantity(item, 1)}
                          disabled={updatingItems[item.cartItemId]}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-gray-900">
                        {item.subTotal?.toLocaleString("vi-VN")}₫
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        disabled={updatingItems[item.cartItemId]}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Tóm tắt đơn hàng
            </h2>

            {/* Voucher Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã giảm giá
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                    placeholder="Nhập mã"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleApplyVoucher}
                  disabled={applyingVoucher || !voucher.trim()}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                  {applyingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Áp dụng"
                  )}
                </button>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Phương thức vận chuyển
              </label>
              <div className="space-y-2">
                {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        shipping === key
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={key}
                        checked={shipping === key}
                        onChange={() => setShipping(key)}
                        className="text-green-500 focus:ring-green-500"
                      />
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        {option.cost === 0
                          ? "Miễn phí"
                          : `${option.cost.toLocaleString("vi-VN")}₫`}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính</span>
                <span className="font-semibold">
                  {subtotal.toLocaleString("vi-VN")}₫
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển</span>
                <span className="font-semibold">
                  {shippingCost === 0
                    ? "Miễn phí"
                    : `${shippingCost.toLocaleString("vi-VN")}₫`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-semibold">
                    -{discount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-green-600">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Thanh Toán Ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                Thanh toán an toàn và bảo mật
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                Miễn phí đổi trả trong 7 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

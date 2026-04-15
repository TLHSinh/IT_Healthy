import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import AddressModal from "../components/AddressModal";
import {
  Truck,
  MapPin,
  CreditCard,
  ShieldCheck,
  Tag,
  ChevronLeft,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";

// ============= CONSTANTS =============
const SHIPPING_OPTIONS = {
  standard: {
    name: "Giao hàng tiêu chuẩn",
    price: 30000,
    days: "3-5 ngày",
    icon: Package,
  },
  express: {
    name: "Giao hàng nhanh",
    price: 50000,
    days: "1-2 ngày",
    icon: Truck,
  },
  pickup: {
    name: "Nhận tại cửa hàng",
    price: 0,
    days: "Hôm nay",
    icon: MapPin,
  },
};

// Chỉ giữ 2 phương thức tương ứng API hiện hỗ trợ: COD + MoMo
const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    icon: "💵",
    description: "Thanh toán tiền mặt khi nhận hàng",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    icon: "🟣",
    description: "Thanh toán qua ví điện tử MoMo",
  },
];

// ============= MAIN COMPONENT =============
export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart: initialCart, shipping: initialShipping } = location.state || {};
  const { user } = useContext(AuthContext);

  // ============= STATES =============
  const [cart] = useState(initialCart);
  const [loading, setLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // Shipping & Payment
  const [shippingMethod, setShippingMethod] = useState(
    initialShipping || "standard"
  );
  const orderType = shippingMethod === "pickup" ? "Pickup" : "Shipping";

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Discount & Notes
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ============= LOAD ADDRESSES =============
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/customeraddresses/by-customer/${user.customerId}`
        );
        setAddresses(res.data || []);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddress(defaultAddr);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách địa chỉ.");
      }
    };

    fetchAddresses();
  }, [user]);

  // ============= SAVE CART TO LOCALSTORAGE =============
  useEffect(() => {
    if (cart) {
      localStorage.setItem("checkout_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // ============= REDIRECT IF NO CART =============
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Giỏ hàng trống. Vui lòng thêm sản phẩm!");
      navigate("/cart");
    }
  }, [cart, navigate]);

  // ============= LOAD STORE KHI PICKUP =============
  useEffect(() => {
    if (shippingMethod !== "pickup") return;

    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stores");
        setStores(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedStore(res.data[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách cửa hàng");
      }
    };

    fetchStores();
  }, [shippingMethod]);

  // ============= CALCULATIONS =============
  const subtotal = cart?.totalPrice || 0;
  const shippingCost = SHIPPING_OPTIONS[shippingMethod]?.price || 0;
  const total = subtotal + shippingCost - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setDiscount(0);
    setAppliedVoucher(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/vouchers/validate",
        {
          code: voucherCode,
          customerId: user.customerId,
          orderTotal: subtotal,
          shippingFee: SHIPPING_OPTIONS[shippingMethod]?.price || 0,
        }
      );

      if (res.data.valid) {
        setDiscount(res.data.discountAmount);
        setAppliedVoucher(res.data.voucherId);
        toast.success(`Áp dụng thành công!`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Có lỗi khi áp dụng mã.");
    }
  };

  // ============= CHECKOUT HANDLER =============
  const handleCheckout = async () => {
    // Validation
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán.");
      navigate("/login");
      return;
    }

    if (orderType === "Shipping" && !selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      setIsAddressModalOpen(true);
      return;
    }

    if (orderType === "Pickup" && !selectedStore) {
      toast.error("Vui lòng chọn cửa hàng nhận hàng.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và điều kiện.");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    if (!["cod", "momo"].includes(paymentMethod)) {
      toast.error("Phương thức thanh toán không hợp lệ.");
      return;
    }

    setLoading(true);

    // Map paymentMethod FE -> API (COD / MOMO)
    const apiPaymentMethod =
      paymentMethod === "cod" ? "COD" : paymentMethod === "momo" ? "MOMO" : "";

    const requestPayload = {
      CustomerId: user.customerId,
      StoreId: orderType === "Pickup" ? selectedStore?.storeId : 1, // TODO: có thể cho user chọn store nếu Shipping theo khu vực
      VoucherId: appliedVoucher,
      PromotionId: null,
      Discount: discount,
      OrderType: orderType,
      OrderNote: orderNotes || "",

      ShippingAddressId:
        orderType === "Shipping" ? selectedAddress?.addressId : null,

      CourierName:
        orderType === "Shipping"
          ? shippingMethod === "express"
            ? "FastExpress"
            : "StandardShip"
          : null,

      ShipDate: orderType === "Shipping" ? new Date().toISOString() : null,
      ShipTime: null,
      ShippingCost: orderType === "Shipping" ? shippingCost : 0,

      PaymentMethod: apiPaymentMethod,

      Items: cart.items.map((item) => ({
        ProductId: item.productId,
        ComboId: item.comboId,
        BowlId: item.bowlId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
      })),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/checkout",
        requestPayload
      );

      const { orderId, payUrl, deeplink } = res.data || {};

      // Nếu có voucher đã áp dụng → gọi API redeem
      if (appliedVoucher && orderId) {
        try {
          await axios.post("http://localhost:5000/api/vouchers/redeem", {
            VoucherId: appliedVoucher,
            CustomerId: user.customerId,
            OrderId: orderId,
            Amount: discount,
          });
        } catch (redeemErr) {
          console.error("Redeem voucher thất bại:", redeemErr);
          toast.error(
            "Không thể áp dụng voucher vào đơn hàng. Vui lòng liên hệ hỗ trợ!"
          );
        }
      }

      // Clear cart from localStorage
      localStorage.removeItem("checkout_cart");

      // Phân nhánh theo phương thức thanh toán
      if (paymentMethod === "momo") {
        // API MoMo của bạn đang trả: { orderId, payUrl, deeplink, message }
        const redirectUrl = payUrl || deeplink;

        if (!redirectUrl) {
          toast.error("Không nhận được link thanh toán MoMo từ hệ thống.");
          return;
        }

        toast.success("Chuyển sang cổng thanh toán MoMo...");
        window.location.href = redirectUrl;
      } else {
        // COD
        toast.success(`Đặt hàng thành công! Mã đơn hàng: ${orderId}`);

        navigate("/OrderSuccess", {
          state: {
            orderId,
            paymentMethod,
            total,
          },
        });
      }
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Đã xảy ra lỗi trong quá trình thanh toán.";
      toast.error(`Thanh toán thất bại: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============= RENDER =============
  if (!cart) return null;

  const isShipping = orderType === "Shipping";

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-1 hover:text-green-600 transition"
          >
            <ChevronLeft size={16} />
            Giỏ hàng
          </button>
          <span>/</span>
          <span className="text-green-600 font-semibold">Thanh toán</span>
        </div>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán đơn hàng
          </h1>
          <p className="text-gray-600">
            Hoàn tất đơn hàng của bạn trong vài bước đơn giản
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. SHIPPING ADDRESS / STORE PICKUP */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="text-green-600" size={24} />
                  {orderType === "Pickup"
                    ? "Nhận tại cửa hàng"
                    : "Địa chỉ giao hàng"}
                </h2>
                {orderType === "Shipping" && (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    {selectedAddress ? "Thay đổi" : "Chọn địa chỉ"}
                  </button>
                )}
              </div>

              {orderType === "Pickup" ? (
                <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    Chọn cửa hàng nhận món
                  </p>

                  <select
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    value={selectedStore?.storeId || ""}
                    onChange={(e) => {
                      const store = stores.find(
                        (s) => s.storeId === parseInt(e.target.value, 10)
                      );
                      setSelectedStore(store);
                    }}
                  >
                    {stores.map((store) => (
                      <option key={store.storeId} value={store.storeId}>
                        {store.storeName} - {store.district}
                      </option>
                    ))}
                  </select>

                  {selectedStore && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p>
                        <strong>Địa chỉ:</strong> {selectedStore.streetAddress},{" "}
                        {selectedStore.ward}, {selectedStore.district},{" "}
                        {selectedStore.city}
                      </p>
                      <p>
                        <strong>SĐT:</strong> {selectedStore.phone}
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedAddress ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {selectedAddress.receiverName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAddress.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    {selectedAddress.streetAddress}, {selectedAddress.ward},{" "}
                    {selectedAddress.district}, {selectedAddress.city}
                  </p>
                  {selectedAddress.isDefault && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <AlertCircle
                    className="mx-auto mb-2 text-gray-400"
                    size={32}
                  />
                  <p className="text-gray-600 mb-3">
                    Chưa có địa chỉ giao hàng
                  </p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>
              )}
            </div>

            {/* 2. SHIPPING METHOD */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Truck className="text-green-600" size={24} />
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                        shippingMethod === key
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={key}
                          checked={shippingMethod === key}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-5 h-5 text-green-600"
                        />
                        <Icon size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            {option.days}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">
                        {option.price === 0
                          ? "Miễn phí"
                          : `${option.price.toLocaleString("vi-VN")}₫`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. PAYMENT METHOD */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="text-green-600" size={24} />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                      paymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <p className="font-medium text-gray-900">
                          {method.name}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {method.description}
                      </p>
                      {method.id === "momo" && (
                        <p className="text-xs text-purple-500 mt-1">
                          Bạn sẽ được chuyển sang cổng thanh toán MoMo sau khi
                          tạo đơn.
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. ORDER NOTES */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">
                Ghi chú đơn hàng (tùy chọn)
              </h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="VD: Giao hàng giờ hành chính, gọi trước 15 phút..."
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* ORDER ITEMS */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">
                  Đơn hàng ({cart.items.length} sản phẩm)
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-16 h-16 bg-white-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={
                            item.imageProduct ||
                            "https://via.placeholder.com/100"
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {item.productName}
                        </h3>
                        {item.comboName && (
                          <p className="text-xs text-gray-500">
                            Combo: {item.comboName}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            x{item.quantity}
                          </span>
                          <span className="font-semibold text-green-600 text-sm">
                            {item.subTotal?.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VOUCHER */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Tag className="text-green-600" size={20} />
                  Mã giảm giá
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) =>
                      setVoucherCode(e.target.value.toUpperCase())
                    }
                    disabled={discount > 0}
                    placeholder="Nhập mã"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={discount > 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:bg-gray-300"
                  >
                    Áp dụng
                  </button>
                </div>

                {appliedVoucher && discount > 0 && (
                  <div className="flex justify-between text-green-600 mt-2 text-sm">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}

                {discount > 0 && (
                  <>
                    <button
                      className="text-red-600 text-sm mt-2"
                      onClick={() => {
                        setVoucherCode("");
                        setDiscount(0);
                        setAppliedVoucher(null);
                      }}
                    >
                      Xóa mã
                    </button>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      ✓ Giảm giá: -{discount.toLocaleString("vi-VN")}₫
                    </p>
                  </>
                )}
              </div>

              {/* PRICE SUMMARY */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-4">Tổng cộng</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">
                      {shippingCost === 0
                        ? "Miễn phí"
                        : `${shippingCost.toLocaleString("vi-VN")}₫`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{discount.toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Tổng thanh toán
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {total.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* TERMS */}
                <label className="flex items-start gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-green-600 mt-0.5"
                  />
                  <span className="text-xs text-gray-600">
                    Tôi đồng ý với{" "}
                    <a href="/terms" className="text-green-600 hover:underline">
                      Điều khoản và Điều kiện
                    </a>{" "}
                    của Soumaki
                  </span>
                </label>

                {/* CHECKOUT BUTTON */}
                <button
                  onClick={handleCheckout}
                  disabled={
                    loading ||
                    !agreeTerms ||
                    (isShipping && !selectedAddress) ||
                    (!isShipping && !selectedStore)
                  }
                  className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold text-lg mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      {paymentMethod === "momo"
                        ? "Đặt hàng & thanh toán với MoMo"
                        : "Đặt hàng (COD)"}
                    </>
                  )}
                </button>

                {/* SECURITY BADGE */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <ShieldCheck size={16} className="text-green-600" />
                  Thanh toán an toàn & bảo mật
                </div>

                {/* ADDRESS MODAL */}
                <AddressModal
                  user={user}
                  addresses={addresses}
                  setAddresses={setAddresses}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  isOpen={isAddressModalOpen}
                  onClose={() => setIsAddressModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

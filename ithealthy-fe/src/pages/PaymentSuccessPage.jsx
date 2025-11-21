import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Loader,
  Package,
  Home,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState(null);

  const rawOrderId = searchParams.get("orderId");
  const resultCode = parseInt(searchParams.get("resultCode") || "0");

  // Parse orderId: MoMo trả về format "55-1763666318", ta cần lấy phần đầu (system OrderId)
  const systemOrderId = rawOrderId?.includes("-")
    ? rawOrderId.split("-")[0]
    : rawOrderId;

  const isSuccess = resultCode === 0;

  useEffect(() => {
    const id = localStorage.getItem("cartId");
    if (!id) {
      toast.error("Không tìm thấy cartId");
    }
  }, []);

  const handlePostCheckout = async () => {
    if (!systemOrderId) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return false;
    }

    const cartId = localStorage.getItem("cartId"); // hoặc source khác nếu bạn lưu cartId nơi khác

    if (!cartId) {
      toast.error("Không tìm thấy giỏ hàng để xác nhận");
      return false;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/Checkout/confirm-order`,
        {
          orderId: parseInt(systemOrderId),
          cartId: parseInt(cartId),
        }
      );

      if (response.data?.message) {
        setPaymentConfirmed(true);
        toast.success("Đơn hàng đã được xử lý thành công!");
        return true;
      } else {
        setError(response.data.message || "Xử lý đơn hàng thất bại");
        toast.error(response.data.message || "Xử lý đơn hàng thất bại");
        return false;
      }
    } catch (err) {
      console.error("Error processing order:", err);
      setError(err.response?.data || "Không thể xử lý đơn hàng");
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = async () => {
    if (isSuccess && !paymentConfirmed) {
      await handlePostCheckout();
    }
    navigate("/");
  };

  const handleContinueShopping = async () => {
    if (isSuccess && !paymentConfirmed) {
      await handlePostCheckout();
    }
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Status Icon */}
          <div className="text-center mb-6">
            {isSuccess ? (
              <>
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Thanh toán thành công!
                </h1>
                <p className="text-gray-600">
                  {paymentConfirmed
                    ? "Đơn hàng của bạn đã được xác nhận và đang được xử lý."
                    : "Vui lòng nhấn nút bên dưới để hoàn tất đơn hàng."}
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Thanh toán thất bại
                </h1>
                <p className="text-gray-600">
                  Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử
                  lại.
                </p>
              </>
            )}
          </div>

          {/* Order Details */}
          {systemOrderId && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">#{systemOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-semibold ${
                      isSuccess
                        ? paymentConfirmed
                          ? "text-green-600"
                          : "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {isSuccess
                      ? paymentConfirmed
                        ? "Đã xác nhận"
                        : "Chờ xác nhận"
                      : "Thất bại"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-semibold">MoMo</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                <strong>Lỗi:</strong> {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-8">
            {isSuccess && (
              <button
                onClick={async () => {
                  const ok = await handlePostCheckout();
                  if (ok) navigate(`/CustomerOrders`);
                }}
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    Xem đơn hàng
                  </>
                )}
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleGoHome}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Home size={20} />
                Về trang chủ
              </button>
              <button
                onClick={handleContinueShopping}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag size={20} />
                Tiếp tục mua sắm
              </button>
            </div>

            {/* Retry Payment Button for Failed Payments */}
            {!isSuccess && (
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Thử lại thanh toán
              </button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {isSuccess && paymentConfirmed && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              <strong>Lưu ý:</strong> Bạn sẽ nhận được email xác nhận đơn hàng
              trong vài phút tới. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ
              với chúng tôi qua hotline hoặc email hỗ trợ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

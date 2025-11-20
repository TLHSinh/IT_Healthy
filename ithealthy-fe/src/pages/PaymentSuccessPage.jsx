import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader, Package, Home } from "lucide-react";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  const rawOrderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");

  // Parse orderId: MoMo trả về format "55-1763666318", ta cần lấy phần đầu (system OrderId)
  const systemOrderId = rawOrderId?.includes("-") 
    ? rawOrderId.split("-")[0] 
    : rawOrderId;

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!systemOrderId) {
        setError("Không tìm thấy thông tin đơn hàng");
        setLoading(false);
        return;
      }

      try {
        // Gọi API để lấy thông tin order và payment
        const response = await axios.get(
          `http://localhost:5000/api/orders/${systemOrderId}`
        );

        setOrderDetails(response.data);

        // Kiểm tra payment status
        const payment = response.data.payments?.find(
          (p) => p.paymentMethod === "MOMO"
        );

        if (payment) {
          setPaymentStatus(payment.status);
        } else {
          setPaymentStatus("Unknown");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    // Delay một chút để đảm bảo IPN đã được xử lý
    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 2000);

    return () => clearTimeout(timer);
  }, [systemOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát, chúng tôi đang xác nhận thanh toán của
            bạn
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === "Success";
  const isPending = paymentStatus === "Pending";

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
                  Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
                </p>
              </>
            ) : isPending ? (
              <>
                <Loader className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-spin" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Đang xử lý thanh toán
                </h1>
                <p className="text-gray-600">
                  Thanh toán của bạn đang được xác nhận. Vui lòng đợi trong giây
                  lát.
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
          {orderDetails && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">#{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-semibold ${
                      isSuccess
                        ? "text-green-600"
                        : isPending
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {orderDetails.statusOrder}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {orderDetails.finalPrice?.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-semibold">MoMo</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {isSuccess && (
              <button
                onClick={() => navigate(`/orders/${systemOrderId}`)}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Xem đơn hàng
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className={`${
                isSuccess ? "flex-1" : "w-full"
              } bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2`}
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>

          {/* Retry Payment Button for Failed Payments */}
          {!isSuccess && !isPending && (
            <button
              onClick={() => navigate("/cart")}
              className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Thử lại thanh toán
            </button>
          )}
        </div>

        {/* Additional Info */}
        {isSuccess && (
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

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderId } = location.state || {};

  if (!orderId) {
    navigate("/"); // nếu không có orderId, quay về trang chủ
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-500 mb-4">
          Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.
        </p>
        <p className="text-gray-700 font-semibold">Mã đơn hàng: {orderId}</p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition font-semibold"
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { X, Eye, Package, Tag, BadgeDollarSign, Flame, Beef, Wheat, Droplets } from "lucide-react";

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Chưa có";
  }

  return Number(value).toLocaleString("vi-VN");
};

const InfoItem = ({ icon: Icon, label, value, valueClassName = "" }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <div className={`text-base font-semibold text-gray-800 ${valueClassName}`}>
      {value || "Chưa có"}
    </div>
  </div>
);

const ProductDetailModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-700">
            <Eye className="h-5 w-5" />
            Chi tiết sản phẩm
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              {product.imageProduct ? (
                <img
                  src={product.imageProduct}
                  alt={product.productName}
                  className="h-80 w-full object-cover"
                />
              ) : (
                <div className="flex h-80 items-center justify-center text-gray-400">
                  Không có ảnh sản phẩm
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-indigo-50 p-4">
              <div className="mb-2 text-sm font-medium text-indigo-600">
                Trạng thái kinh doanh
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  product.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.isAvailable ? "Có hàng" : "Hết hàng"}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                Mã sản phẩm: #{product.productId}
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {product.productName}
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={Tag}
                label="Danh mục"
                value={product.categoryName}
              />
              <InfoItem
                icon={BadgeDollarSign}
                label="Giá cơ bản"
                value={`${formatNumber(product.basePrice)} VND`}
                valueClassName="text-indigo-600"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Package className="h-5 w-5 text-indigo-600" />
                Mô tả sản phẩm
              </div>
              <p className="whitespace-pre-line leading-7 text-gray-600">
                {product.descriptionProduct || "Chưa có mô tả"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-4 text-lg font-bold text-gray-800">
                Thông tin dinh dưỡng
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem
                  icon={Flame}
                  label="Calories"
                  value={formatNumber(product.calories)}
                  valueClassName="text-orange-600"
                />
                <InfoItem
                  icon={Beef}
                  label="Protein"
                  value={`${formatNumber(product.protein)} g`}
                  valueClassName="text-rose-600"
                />
                <InfoItem
                  icon={Wheat}
                  label="Carbs"
                  value={`${formatNumber(product.carbs)} g`}
                  valueClassName="text-amber-600"
                />
                <InfoItem
                  icon={Droplets}
                  label="Fat"
                  value={`${formatNumber(product.fat)} g`}
                  valueClassName="text-sky-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

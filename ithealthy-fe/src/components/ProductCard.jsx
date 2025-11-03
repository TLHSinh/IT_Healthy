import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="relative flex flex-col items-center bg-[#fff8f0] rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* ❤️ Icon yêu thích */}
      <div
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full"
        style={{ backgroundColor: "#ff623e", color: "#f5edd8" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
          2 6 3.5 4 5.5 4c1.54 0 3.04.99 3.57 2.36h1.87C13.46 4.99 
          14.96 4 16.5 4 18.5 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 
          11.54L12 21.35z"
          />
        </svg>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="relative w-full flex justify-center mb-4">
        <img
          src={product.imageProduct}
          alt={product.productName}
          className="w-56 h-56 object-contain drop-shadow-md rounded-full bg-white p-4"
        />
        <img
          src="https://soumaki.com.vn/wp-content/uploads/2024/03/Shadow.svg"
          alt=""
          className="absolute bottom-0 w-1/2 opacity-60"
        />
      </div>

      {/* Tên & Calories */}
      <div className="flex justify-between items-center w-full mb-2">
        <h3 className="text-xl font-bold text-[#3E0D1C]">
          {product.productName}
        </h3>
        {product.calories && (
          <span className="text-sm font-semibold text-[#3E0D1C] border border-[#3E0D1C] rounded-full px-3 py-1">
            {product.calories} CALORIES
          </span>
        )}
      </div>

      {/* Mô tả món ăn */}
      <p className="text-gray-700 text-sm mb-3 text-center min-h-[40px]">
        {product.descriptionProduct}
      </p>

      <div className="w-full border-dotted border-b border-gray-400 mb-3"></div>

      {/* Dữ liệu dinh dưỡng */}
      <div className="flex justify-around w-full text-[#3E0D1C] font-semibold mb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg">{product.protein || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">PROTEIN</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{product.carbs || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">CARBS</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{product.fat || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">FAT</span>
        </div>
      </div>

      {/* Nút tải công thức */}
      <button
        onClick={() => alert(`Tải công thức cho ${product.productName}`)}
        className="w-full py-2 bg-[#ff623e] text-white font-semibold rounded-full hover:bg-[#e55734] transition-all"
      >
        Download recipe
      </button>
    </div>
  );
}

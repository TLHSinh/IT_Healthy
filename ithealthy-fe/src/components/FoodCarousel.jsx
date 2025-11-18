import React, { useEffect, useRef, useState, useContext } from "react";
import { Clock, ChefHat, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MealCard = ({ meal, onAddToCart }) => {
  return (
    <div className="group relative flex flex-col items-center bg-[#fff8f0] rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden min-w-[320px] flex-shrink-0">
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
          src={meal.imageProduct || "/api/placeholder/400/320"}
          alt={meal.productName}
          className="group-hover:drop-shadow-2xl w-48 h-48 object-contain drop-shadow-md rounded-full bg-white p-4 transform transition-transform duration-500 group-hover:-translate-y-3 group-hover:scale-110"
        />
      </div>

      {/* Tên & Calories */}
      <div className="flex justify-between items-center w-full mb-2">
        <h3 className="text-xl font-bold text-[#3E0D1C]">{meal.productName}</h3>
        {meal.calories && (
          <span className="text-sm font-semibold text-[#3E0D1C] border border-[#3E0D1C] rounded-full px-3 py-1">
            {meal.calories} CAL
          </span>
        )}
      </div>

      {/* Mô tả */}
      <p className="text-gray-700 text-sm mb-3 text-center min-h-[40px]">
        {meal.descriptionProduct || meal.ingredients?.join(", ") || "—"}
      </p>

      {/* Dấu chấm ngăn cách */}
      <div
        className="w-full h-[2px] mb-2"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 2.5px, transparent 2px)",
          backgroundSize: "10px 4px",
          backgroundRepeat: "repeat-x",
          color: "#928e8eff",
        }}
      ></div>

      {/* Dinh dưỡng */}
      <div className="flex justify-around w-full text-[#3E0D1C] font-semibold mb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg">{meal.protein || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">PROTEIN</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{meal.carbs || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">CARBS</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{meal.fat || 0}</span>
          <span className="text-xs tracking-wide text-gray-500">FAT</span>
        </div>
      </div>

      {/* Giá & nút thêm vào giỏ */}
      <div className="flex items-center justify-between w-full mt-auto">
        <span className="text-xl font-bold text-[#ff623e]">
          {meal.basePrice?.toLocaleString("vi-VN") || 0}₫
        </span>
        <button
          onClick={() => onAddToCart && onAddToCart(meal)}
          className="w-10 h-10 flex items-center justify-center bg-[#ff623e] text-white rounded-full hover:bg-[#e55734] transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const MealCarousel = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef(null);
  const { user } = useContext(AuthContext); // 🟢 Lấy thông tin user hiện tại

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      const dto = {
        customerId: user?.customerId || 1, // hoặc lấy từ context
        productId: product.productId,
        comboId: null,
        bowlId: null,
        quantity: 1,
        unitPrice: product.basePrice,
      };
      const res = await axios.post("http://localhost:5000/api/cart/add", dto);
      alert(res.data.message || "Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/products/all-products"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMeals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching meals:", err);
      // Sample data for demo
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // card width + gap
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" from-orange-50 to-yellow-50  px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {meals.map((meal, index) => (
              <MealCard
                key={meal.productId || index}
                meal={meal}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MealCarousel;

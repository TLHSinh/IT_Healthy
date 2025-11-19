import React, { useEffect, useRef, useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function MenuPage() {
  const { submenuOpen } = useOutletContext(); // 🟢 nhận từ MainLayout
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const sectionRefs = useRef({}); // Lưu ref cho từng category
  const { user } = useContext(AuthContext); // 🟢 Lấy thông tin user hiện tại

  useEffect(() => {
    fetch("http://localhost:5000/api/category/category_pro")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));

    fetch("http://localhost:5000/api/products/all-products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // 🟢 Hàm cuộn đến phần tương ứng
  const scrollToCategory = (categoryId) => {
    const ref = sectionRefs.current[categoryId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      const dto = {
        customerId: user.customerId, // ✅ tự động lấy từ context
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

  return (
    <div className=" min-h-screen pb-16 scroll-smooth pt-24">
      {/* ===== Thanh Category (luôn cố định khi cuộn) ===== */}
      <div
        className={`fixed left-0 right-0 z-[200] transition-all duration-300 ${
          submenuOpen ? "top-36" : "top-20"
        }`}
      >
        <div className="flex justify-center p-8">
          <div className="flex items-center gap-8 bg-green-200 rounded-full px-2 py-1 shadow-md">
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => scrollToCategory(cat.categoryId)}
                className="px-4 py-2 rounded-full font-semibold tracking-wide text-[#3E0D1C] hover:bg-[#FFF6E5] transition-all"
              >
                {cat.categoryName.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Hiển thị từng category ===== */}
      <div className="max-w-7xl mx-auto flex flex-col gap-16 px-6 ">
        {categories.map((cat) => {
          const filteredProducts = products.filter(
            (p) =>
              p.categoryName.toLowerCase() === cat.categoryName.toLowerCase()
          );

          // Tạo ref cho từng section
          if (!sectionRefs.current[cat.categoryId]) {
            sectionRefs.current[cat.categoryId] = React.createRef();
          }

          return (
            <section
              key={cat.categoryId}
              ref={sectionRefs.current[cat.categoryId]}
              className="scroll-mt-24"
            >
              {/* Lưới chứa cả banner và sản phẩm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Banner là 1 “card” lớn chiếm 1/2 hàng đầu tiên */}
                <div className="group relative rounded-3xl overflow-hidden shadow-md lg:col-span-2 transition-all duration-500 hover:shadow-xl">
                  <img
                    src={
                      cat.imageCategories ||
                      "https://soumaki.com.vn/wp-content/uploads/2024/03/default-banner.png"
                    } // ảnh fallback nếu không có
                    alt={cat.categoryName}
                    className="w-full h-full object-cover brightness-90 transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center text-white transition-all duration-500 group-hover:bg-black/20">
                    <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                      {cat.categoryName}
                    </h2>
                    <p className="max-w-2xl text-lg">{cat.descriptionCat}</p>
                  </div>
                </div>

                {filteredProducts.map((p) => (
                  <div
                    key={p.productId}
                    className="group relative flex flex-col items-center bg-[#fff8f0] rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
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
                        src={p.imageProduct}
                        alt={p.productName}
                        className="group-hover:drop-shadow-2xl w-56 h-56 object-contain drop-shadow-md rounded-full bg-white p-4 transform transition-transform duration-500 group-hover:-translate-y-3 group-hover:scale-110"
                      />
                    </div>

                    {/* Tên & Calories */}
                    <div className="flex justify-between items-center w-full mb-2">
                      <h3 className="text-xl font-bold text-[#3E0D1C]">
                        {p.productName}
                      </h3>
                      {p.calories && (
                        <span className="text-sm font-semibold text-[#3E0D1C] border border-[#3E0D1C] rounded-full px-3 py-1">
                          {p.calories} CALORIES
                        </span>
                      )}
                    </div>

                    {/* Mô tả */}
                    <p className="text-gray-700 text-sm mb-3 text-center min-h-[40px]">
                      {p.descriptionProduct}
                    </p>

                    {/* Dấu chấm ngăn cách */}
                    <div
                      className="w-full h-[2px] mb-1"
                      style={{
                        backgroundImage:
                          "radial-gradient(currentColor 2.5px, transparent 2px)",
                        backgroundSize: "10px 4px",
                        backgroundRepeat: "repeat-x",
                        color: "#928e8eff",
                      }}
                    ></div>

                    {/* Dữ liệu dinh dưỡng */}
                    <div className="flex justify-around w-full text-[#3E0D1C] font-semibold mb-4">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{p.protein || 0}</span>
                        <span className="text-xs tracking-wide text-gray-500">
                          PROTEIN
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{p.carbs || 0}</span>
                        <span className="text-xs tracking-wide text-gray-500">
                          CARBS
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{p.fat || 0}</span>
                        <span className="text-xs tracking-wide text-gray-500">
                          FAT
                        </span>
                      </div>
                    </div>

                    {/* Giá & Nút thêm vào giỏ */}
                    <div className="flex items-center justify-between w-full mt-auto">
                      <span className="text-xl font-bold text-[#ff623e]">
                        {p.basePrice?.toLocaleString("vi-VN")}₫
                      </span>

                      <button
                        onClick={() => handleAddToCart(p)}
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
                ))}

                {filteredProducts.length === 0 && (
                  <p className="text-center text-gray-600 col-span-full">
                    (Chưa có món ăn nào cho danh mục này)
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

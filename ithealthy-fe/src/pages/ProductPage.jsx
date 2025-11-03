import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function MenuPage() {
  const { submenuOpen } = useOutletContext(); // 🟢 nhận từ MainLayout
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const sectionRefs = useRef({}); // Lưu ref cho từng category

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

  // Ảnh banner mẫu cho từng loại category (tuỳ chỉnh theo dữ liệu thực tế)
  const bannerImages = {
    "Ít calo": "https://soumaki.com.vn/wp-content/uploads/2024/03/L1.png",
    "Cân bằng": "https://soumaki.com.vn/wp-content/uploads/2024/03/B1.png",
    "Giàu đạm": "https://soumaki.com.vn/wp-content/uploads/2024/03/H1.png",
    Chay: "https://soumaki.com.vn/wp-content/uploads/2024/03/V1.png",
  };

  // 🟢 Hàm cuộn đến phần tương ứng
  const scrollToCategory = (categoryId) => {
    const ref = sectionRefs.current[categoryId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <div className="flex justify-center p-2">
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
              {/* Banner từng category */}
              <div className="relative rounded-3xl overflow-hidden shadow-md mb-8">
                <img
                  src={
                    bannerImages[cat.categoryName] || bannerImages["Ít calo"]
                  }
                  alt={cat.categoryName}
                  className="w-full h-72 object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center text-white">
                  <h2 className="text-4xl font-bold mb-2">
                    {cat.categoryName}
                  </h2>
                  <p className="max-w-2xl text-lg">{cat.descriptionCat}</p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                  <div
                    key={p.productId}
                    className="relative flex flex-col items-center bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Icon yêu thích */}
                    <div
                      className="absolute top-3 left-3 rounded-full p-2"
                      style={{ backgroundColor: "#ff623e", color: "#f5edd8" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 
          3.5 4 5.5 4c1.54 0 3.04.99 
          3.57 2.36h1.87C13.46 4.99 14.96 4 16.5 
          4 18.5 4 20 6 20 8.5c0 3.78-3.4 
          6.86-8.55 11.54L12 21.35z"
                        />
                      </svg>
                    </div>

                    {/* Ảnh sản phẩm */}
                    <div className="relative w-full flex justify-center bg-[#f9f9f9]">
                      <img
                        src={p.imageProduct}
                        alt={p.productName}
                        className="w-60 h-60 object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      {/* Hiệu ứng shadow dưới ảnh */}
                      <img
                        src="https://soumaki.com.vn/wp-content/uploads/2024/03/Shadow.svg"
                        alt=""
                        className="absolute bottom-0 w-2/3 opacity-70"
                      />
                    </div>

                    {/* Nội dung */}
                    <div className="p-4 text-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {p.productName}
                      </h3>

                      <p className="text-sm text-gray-500 line-clamp-2">
                        {p.descriptionProduct}
                      </p>

                      {p.basePrice && (
                        <p className="text-[#ff623e] font-semibold text-base">
                          {p.basePrice.toLocaleString()}₫
                        </p>
                      )}

                      {/* Dữ liệu dinh dưỡng — chỉ hiện nếu có */}
                      {p.protein && (
                        <div className="flex justify-center gap-4 text-gray-700 font-medium mt-2">
                          <div>
                            {p.protein}{" "}
                            <span className="text-gray-500 text-sm">
                              PROTEIN
                            </span>
                          </div>
                          <div>
                            {p.carbs}{" "}
                            <span className="text-gray-500 text-sm">CARBS</span>
                          </div>
                          <div>
                            {p.fat}{" "}
                            <span className="text-gray-500 text-sm">FAT</span>
                          </div>
                        </div>
                      )}

                      {/* Nút tải công thức (nếu bạn có API tương tự) */}
                      <button
                        onClick={() =>
                          alert(`Tải công thức cho ${p.productName}`)
                        }
                        className="mt-4 px-6 py-2 bg-[#ff623e] text-white font-semibold rounded-full shadow hover:bg-[#e55734] transition-all"
                      >
                        Download Recipe
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

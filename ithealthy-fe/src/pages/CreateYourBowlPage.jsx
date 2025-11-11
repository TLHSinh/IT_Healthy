import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";

export default function CreateYourBowlPage() {
  const { submenuOpen } = useOutletContext(); // 🟢 nhận từ MainLayout
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedCounts, setSelectedCounts] = useState({});
  const sectionRefs = useRef({}); // Lưu ref từng category

  // ===== Lấy danh mục category =====
  useEffect(() => {
    fetch("http://localhost:5000/api/category/category_ing")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // ===== Lấy danh sách nguyên liệu =====
  useEffect(() => {
    fetch("http://localhost:5000/api/ingredient/all-ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error(err));
  }, []);

  // Gom nhóm nguyên liệu theo categoryName
  const grouped = ingredients.reduce((acc, item) => {
    if (!acc[item.categoryName]) acc[item.categoryName] = [];
    acc[item.categoryName].push(item);
    return acc;
  }, {});

  // Tăng/giảm số lượng
  const handleChange = (id, delta) => {
    setSelectedCounts((prev) => {
      const newCount = Math.max((prev[id] || 0) + delta, 0);
      return { ...prev, [id]: newCount };
    });
  };

  // Scroll đến category tương ứng
  const scrollToCategory = (categoryName) => {
    const el = sectionRefs.current[categoryName];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex bg-[#FAF4E1] min-h-screen gap-6 px-6">
      {/* ===== Bên trái - danh sách nguyên liệu (70%) ===== */}
      <div className="w-7/10 relative flex-grow">
        {/* Thanh Category (luôn cố định khi cuộn) */}
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
                  onClick={() => scrollToCategory(cat.categoryName)}
                  className="px-4 py-2 rounded-full font-semibold tracking-wide text-[#3E0D1C] hover:bg-[#FFF6E5] transition-all"
                >
                  {cat.categoryName.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách nguyên liệu */}
        <div className="p-8 space-y-10 pt-40">
          {Object.entries(grouped).map(([category, items], index) => (
            <div
              key={category}
              ref={(el) => (sectionRefs.current[category] = el)}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#7B3F00] text-white rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
                <h2 className="text-lg font-bold text-[#5A2E00] uppercase">
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div
                    key={item.ingredientId}
                    className={`rounded-2xl shadow-md p-4 flex flex-col items-center bg-[#faf5e8] hover:bg-[#D7F5E9] transition ${
                      selectedCounts[item.ingredientId] > 0
                        ? "bg-[#D7F5E9]"
                        : "bg-[#FFF6E5]"
                    }`}
                  >
                    <img
                      src={item.imageIngredients}
                      alt={item.ingredientName}
                      className="w-28 h-28 object-contain mb-3"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleChange(item.ingredientId, -1)}
                        className="px-2 py-1 rounded-full bg-white border"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold">
                        {selectedCounts[item.ingredientId] || 0}
                      </span>
                      <button
                        onClick={() => handleChange(item.ingredientId, 1)}
                        className="px-2 py-1 rounded-full bg-white border"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-center font-medium text-[#5A2E00]">
                      {item.ingredientName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Bên phải - tóm tắt (luôn cố định khi cuộn) ===== */}
      <div className="w-3/10 sticky top-24 bg-[#FFF8EC] rounded-2xl shadow-md p-4 overflow-y-auto max-h-[85vh]">
        <h2 className="text-lg font-bold text-center mb-1 text-[#5A2E00]">
          Tô healthy của bạn
        </h2>
        <p className="text-center text-xs mb-3 text-[#7B3F00]">
          Lựa chọn nguyên liệu và xốt để tính toán calo cho bữa ăn healthy của
          bạn
        </p>

        <hr className="border-dotted border-[#5A2E00] mb-3" />

        {Object.entries(grouped).map(([category, items]) => {
          const selectedItems = items.filter(
            (i) => selectedCounts[i.ingredientId] > 0
          );
          if (selectedItems.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-semibold text-[#5A2E00] mb-1 uppercase">
                {category}
              </h3>
              {selectedItems.map((item) => (
                <div
                  key={item.ingredientId}
                  className="flex items-center gap-3 mb-2 bg-[#E6F6ED] rounded-xl p-2"
                >
                  <img
                    src={item.imageIngredients}
                    alt={item.ingredientName}
                    className="w-10 h-10 object-contain rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#5A2E00]">
                      {item.ingredientName}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => handleChange(item.ingredientId, -1)}
                        className="px-2 border rounded-full bg-white"
                      >
                        −
                      </button>
                      <span>{selectedCounts[item.ingredientId]}</span>
                      <button
                        onClick={() => handleChange(item.ingredientId, 1)}
                        className="px-2 border rounded-full bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Tổng calo */}
        <hr className="border-dotted border-[#5A2E00] mb-3" />
        <div className="grid grid-cols-4 text-center text-[#5A2E00] font-semibold text-xs">
          <div>
            <div className="text-base">
              {ingredients
                .reduce(
                  (sum, i) =>
                    sum +
                    (i.calories || 0) * (selectedCounts[i.ingredientId] || 0),
                  0
                )
                .toFixed(0)}
            </div>
            <div>CALO</div>
          </div>
          <div>
            <div className="text-base">
              {ingredients
                .reduce(
                  (sum, i) =>
                    sum +
                    (i.protein || 0) * (selectedCounts[i.ingredientId] || 0),
                  0
                )
                .toFixed(1)}
              g
            </div>
            <div>PROT</div>
          </div>
          <div>
            <div className="text-base">
              {ingredients
                .reduce(
                  (sum, i) =>
                    sum +
                    (i.carbs || 0) * (selectedCounts[i.ingredientId] || 0),
                  0
                )
                .toFixed(1)}
              g
            </div>
            <div>CARB</div>
          </div>
          <div>
            <div className="text-base">
              {ingredients
                .reduce(
                  (sum, i) =>
                    sum + (i.fat || 0) * (selectedCounts[i.ingredientId] || 0),
                  0
                )
                .toFixed(1)}
              g
            </div>
            <div>FAT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

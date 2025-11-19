import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, List, Grid, Search } from "lucide-react";

const PAGE_SIZE = 8;

const UserBowlPage = () => {
  const [bowls, setBowls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const fetchBowls = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/bowl/user/1");
      setBowls(res.data); // giả sử trả về mảng bowl
    } catch (err) {
      toast.error("Lấy dữ liệu Bowl thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBowls();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse text-lg font-semibold">
        Đang tải dữ liệu...
      </p>
    );

  // 🔹 Filter theo search term
  const filteredBowls = bowls.filter((bowl) =>
    bowl.bowlName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredBowls.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredBowls.slice(startIndex, endIndex);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">
      <div className="text-gray-600 font-medium">
        Hiển thị{" "}
        <span className="text-indigo-600 font-bold">
          {filteredBowls.length === 0
            ? 0
            : Math.min(filteredBowls.length, page * PAGE_SIZE)}
        </span>{" "}
        / {filteredBowls.length} bowl
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1 || totalPages === 0}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          « Đầu
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || totalPages === 0}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>
        <span className="px-3 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm">
          {totalPages === 0 ? 0 : page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cuối »
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#F8F4E9] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-3xl font-extrabold text-blue-600">Bowl của bạn</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 transition">
            <input
              type="text"
              placeholder="Tìm kiếm bowl..."
              className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <div className="px-3 text-gray-400 border-l border-gray-200">
              <Search size={20} />
            </div>
          </div>

          <button
            onClick={fetchBowls}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            <RefreshCcw className="w-4 h-4" /> Làm mới
          </button>

          <div className="flex gap-2 border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center px-3 py-2 transition rounded-full ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Table view"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center justify-center px-3 py-2 transition rounded-full ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Card view"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto shadow-md rounded-lg"
          >
            <table className="min-w-full bg-[#fff8f0] rounded-lg overflow-hidden">
              <thead className="bg-blue-200 text-gray-700 uppercase text-sm sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">Bowl ID</th>
                  <th className="py-3 px-4 text-left">Tên Bowl</th>
                  <th className="py-3 px-4 text-left">Giá</th>
                  <th className="py-3 px-4 text-left">Calories</th>
                  <th className="py-3 px-4 text-left">Protein</th>
                  <th className="py-3 px-4 text-left">Ingredients</th>
                  <th className="py-3 px-4 text-left">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      Không có bowl.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((bowl) => (
                    <tr
                      key={bowl.bowlId}
                      className="border-b hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 font-medium">{bowl.bowlId}</td>
                      <td className="py-3 px-4">{bowl.bowlName}</td>
                      <td className="py-3 px-4">
                        {bowl.totalPrice.toLocaleString()}₫
                      </td>
                      <td className="py-3 px-4">{bowl.baseCalories}</td>
                      <td className="py-3 px-4">{bowl.totalProtein}</td>
                      <td className="py-3 px-4">
                        {bowl.ingredients.map((i) => (
                          <div key={i.ingredientId}>
                            {i.ingredientName} x{i.quantity} (
                            {i.price.toLocaleString()}₫)
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(bowl.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentPageData.map((bowl) => (
              <motion.div
                key={bowl.bowlId}
                layout
                className="bg-[#fff8f0] rounded-xl shadow-lg p-5 transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {bowl.bowlName}
                </h3>
                <p className="text-gray-700 mb-1">
                  Giá: {bowl.totalPrice.toLocaleString()}₫
                </p>
                <p className="text-gray-700 mb-1">
                  Calories: {bowl.baseCalories}
                </p>
                <p className="text-gray-700 mb-2">
                  Protein: {bowl.totalProtein}
                </p>
                <div className="text-gray-700 mb-2">
                  <span className="font-medium">Ingredients:</span>
                  <ul className="list-disc ml-5">
                    {bowl.ingredients.map((i) => (
                      <li key={i.ingredientId}>
                        {i.ingredientName} x{i.quantity} (
                        {i.price.toLocaleString()}₫)
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-500 text-sm">
                  Ngày tạo: {new Date(bowl.createdAt).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 0 && <Pagination />}
    </div>
  );
};

export default UserBowlPage;

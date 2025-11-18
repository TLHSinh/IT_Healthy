import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, RefreshCcw, List, Grid, Search } from "lucide-react";

const PAGE_SIZE = 8;

const PickupOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/orders/filter?type=pickup"
      );
      setOrders(res.data);
    } catch (err) {
      toast.error("Lấy dữ liệu đơn hàng pickup thất bại");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, {
        StatusOrder: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công!");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, statusOrder: newStatus } : o
        )
      );
    } catch (err) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOptions = ["Pending", "Processing", "Completed", "Cancelled"];
  const statusGradient = {
    Pending:
      "bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 text-yellow-900",
    Processing:
      "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-blue-900",
    Completed:
      "bg-gradient-to-r from-green-200 via-green-300 to-green-400 text-green-900",
    Cancelled:
      "bg-gradient-to-r from-red-200 via-red-300 to-red-400 text-red-900",
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse text-lg font-semibold">
        Đang tải dữ liệu...
      </p>
    );

  // 🔹 Filter theo search term
  const filteredOrders = orders.filter(
    (o) =>
      o.orderId.toString().includes(searchTerm) ||
      o.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageData = filteredOrders.slice(startIndex, endIndex);

  // 🔹 Pagination component
  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">
      <div className="text-gray-600 font-medium">
        Hiển thị{" "}
        <span className="text-indigo-600 font-bold">
          {filteredOrders.length === 0
            ? 0
            : Math.min(filteredOrders.length, page * PAGE_SIZE)}
        </span>{" "}
        / {filteredOrders.length} bản ghi
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-blue-600">
          <Building2 className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
          Đơn Nhận tại Cửa hàng
        </h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 transition">
            <input
              type="text"
              placeholder="Tìm kiếm đơn..."
              className="px-4 py-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset page khi search
              }}
            />
            <div className="px-3 text-gray-400 border-l border-gray-200">
              <Search size={20} />
            </div>
          </div>

          <button
            onClick={fetchOrders}
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
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-200 text-gray-700 uppercase text-sm sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">Mã đơn</th>
                  <th className="py-3 px-4 text-left">Khách hàng</th>
                  <th className="py-3 px-4 text-left">Cửa hàng</th>
                  <th className="py-3 px-4 text-left">Ngày đặt</th>
                  <th className="py-3 px-4 text-left">Giá trị</th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 px-4 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      Không có đơn hàng.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 font-medium">{order.orderId}</td>
                      <td className="py-3 px-4">{order.fullName}</td>
                      <td className="py-3 px-4">{order.storeName}</td>
                      <td className="py-3 px-4">{new Date(order.orderDate).toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-gray-700">{order.finalPrice.toLocaleString()}₫</td>
                      <td className="py-3 px-4">
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusGradient[order.statusOrder]}`}
                        >
                          {order.statusOrder}
                        </motion.span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={order.statusOrder}
                            onChange={(e) => updateStatus(order.orderId, e.target.value)}
                            className="appearance-none bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-800 font-medium px-4 py-1 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer transition-all"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => updateStatus(order.orderId, order.statusOrder)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-1 rounded-full transition-colors shadow-md"
                        >
                          Cập nhật
                        </button>
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
            {currentPageData.map((order) => (
              <motion.div
                key={order.orderId}
                layout
                className="bg-white rounded-xl shadow-lg p-5 transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-gray-800">
                    Mã đơn: {order.orderId}
                  </span>
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusGradient[order.statusOrder]}`}
                  >
                    {order.statusOrder}
                  </motion.span>
                </div>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Khách hàng:</span> {order.fullName}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Cửa hàng:</span> {order.storeName}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Ngày đặt:</span> {new Date(order.orderDate).toLocaleString()}
                </p>
                <p className="text-gray-800 font-semibold mb-3">
                  Giá trị: {order.finalPrice.toLocaleString()}₫
                </p>
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <select
                      value={order.statusOrder}
                      onChange={(e) => updateStatus(order.orderId, e.target.value)}
                      className="appearance-none bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-800 font-medium px-4 py-1 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer transition-all"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => updateStatus(order.orderId, order.statusOrder)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-1 rounded-full transition-colors shadow-md"
                  >
                    Cập nhật
                  </button>
                </div>
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

export default PickupOrdersPage;

// CustomerOrdersPage.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  Grid,
  Search,
  X,
  RefreshCcw,
  Printer,
  User,
  MapPin,
  Calendar,
  BadgeCheck,
  Phone,
  Store,
} from "lucide-react";

/* ----------------------------- Helper ----------------------------- */
const fmtCurrency = (v) => Number(v).toLocaleString("vi-VN");
const safeDate = (d) => (d ? new Date(d).toLocaleString() : "—");

/* ----------------------------- Skeleton Row ----------------------------- */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ----------------------------- Modal ----------------------------- */
const OrderModal = ({ order, onClose, printRef }) => {
  if (!order) return null;

  const totalProducts = (order.orderItems || []).reduce(
    (sum, item) => sum + (item.totalPrice ?? item.unitPrice ?? 0),
    0
  );

  const discount = Math.max(
    0,
    totalProducts - (order.finalPrice ?? totalProducts)
  );
  const finalPrice = order.finalPrice ?? totalProducts;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={printRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <List size={22} /> Chi tiết đơn #{order.orderId}
            </h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6 text-gray-700">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} /> Khách hàng: {order.fullName}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} /> SĐT: {order.phoneNumber}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} /> Ngày đặt: {safeDate(order.orderDate)}
              </div>
              <div className="flex items-center gap-2">
                <Store size={16} /> Cửa hàng: {order.storeName}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MapPin size={16} /> Địa chỉ:{" "}
                {`${order.streetAddress}, ${order.ward}, ${order.district}, ${order.city}`}
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} /> Trạng thái: {order.statusOrder}
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
              <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="py-2 px-3 border">#</th>
                    <th className="py-2 px-3 border text-left">Tên SP</th>
                    <th className="py-2 px-3 border">SL</th>
                    <th className="py-2 px-3 border text-right">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-3 text-center">{i + 1}</td>
                      <td className="py-2 px-3">{p.productName}</td>
                      <td className="py-2 px-3 text-center">{p.quantity}</td>
                      <td className="py-2 px-3 text-right">
                        {fmtCurrency(p.unitPrice)}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end gap-6 text-lg font-semibold">
              <div>Tổng: {fmtCurrency(totalProducts)}₫</div>
              {discount > 0 && <div>Giảm: -{fmtCurrency(discount)}₫</div>}
              <div>Khách trả: {fmtCurrency(finalPrice)}₫</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ----------------------------- Main Page ----------------------------- */
const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/by-customer/1"
      );
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter((o) =>
      o.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(`<html><body>${printRef.current.innerHTML}</body></html>`);
    w.print();
    w.close();
  };

  return (
    <div className="p-6 bg-[#F8F4E9] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-gray-500">Quản lý đơn hàng</p>
        </div>

        {/* Search + Refresh + View Mode */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-80 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 w-full outline-none bg-transparent text-sm"
              placeholder="Tìm khách hàng..."
            />
            <div className="px-3 text-gray-500">
              <Search size={18} />
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Làm mới
          </button>

          <div className="flex items-center gap-2 border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 ${
                viewMode === "table" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 ${
                viewMode === "card" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      <AnimatePresence mode="wait">
        {loading ? (
          /* Loading Skeleton */
          <motion.div className="overflow-x-auto bg-white rounded-2xl shadow p-4">
            <table className="min-w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div
            key="table"
            className="overflow-x-auto bg-white rounded-2xl shadow p-2"
          >
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Khách hàng</th>
                  <th className="py-2 px-3">Ngày đặt</th>
                  <th className="py-2 px-3">Giá trị</th>
                  <th className="py-2 px-3">Trạng thái</th>
                  <th className="py-2 px-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o, i) => (
                    <tr
                      key={o.orderId}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-3 text-center">{i + 1}</td>
                      <td className="py-2 px-3">{o.fullName}</td>
                      <td className="py-2 px-3">{safeDate(o.orderDate)}</td>
                      <td className="py-2 px-3">
                        {fmtCurrency(o.finalPrice)}₫
                      </td>
                      <td className="py-2 px-3">{o.statusOrder}</td>
                      <td className="py-2 px-3 flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setTimeout(handlePrint, 200);
                          }}
                          className="px-2 py-1 bg-white border rounded-full"
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        ) : (
          /* Card View */
          <motion.div
            key="card"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.length === 0 ? (
              <div className="col-span-full p-6 text-center bg-white rounded-2xl shadow text-gray-500">
                Không có đơn hàng nào.
              </div>
            ) : (
              filtered.map((o) => (
                <motion.div
                  key={o.orderId}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
                >
                  <div className="text-lg font-bold">{o.fullName}</div>
                  <div className="text-gray-700 mt-1">
                    Giá trị:{" "}
                    <span className="font-semibold">
                      {fmtCurrency(o.finalPrice)}₫
                    </span>
                  </div>

                  <div className="text-gray-500 text-sm mt-1">
                    Ngày đặt: {safeDate(o.orderDate)}
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setTimeout(handlePrint, 200);
                      }}
                      className="px-2 py-1 bg-white border rounded-full text-sm"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        printRef={printRef}
      />
    </div>
  );
};

export default CustomerOrdersPage;

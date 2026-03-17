import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  Search,
  X,
  Printer,
  User,
  MapPin,
  Calendar,
  BadgeCheck,
  Phone,
  Store,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";


// mau trang thái
const statusStyle = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Completed":
      return "bg-green-100 text-green-700 border-green-300";
    case "Cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
};
/* ================= Helper ================= */
const fmtCurrency = (v) => Number(v).toLocaleString("vi-VN");
const safeDate = (d) => (d ? new Date(d).toLocaleString() : "—");

/* ================= Modal ================= */
const OrderModal = ({ order, onClose, printRef }) => {
  if (!order) return null;

  const total = order.orderItems?.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0
  );

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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <List size={20} /> Đơn hàng #{order.orderId}
            </h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-sm">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="flex gap-2">
                <User size={16} /> {order.fullName}
              </div>
              <div className="flex gap-2">
                <Phone size={16} /> {order.phoneNumber}
              </div>
              <div className="flex gap-2">
                <Calendar size={16} /> {safeDate(order.orderDate)}
              </div>
              <div className="flex gap-2">
                <Store size={16} /> {order.storeName}
              </div>
              <div className="col-span-2 flex gap-2">
                <MapPin size={16} />{" "}
                {`${order.streetAddress}, ${order.ward}, ${order.district}, ${order.city}`}
              </div>
              <div className="flex gap-2">
                <BadgeCheck size={16} /> {order.statusOrder}
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2">SL</th>
                    <th className="p-2 text-right">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 text-center">{i + 1}</td>
                      <td className="p-2">{p.productName}</td>
                      <td className="p-2 text-center">{p.quantity}</td>
                      <td className="p-2 text-right">
                        {fmtCurrency(p.unitPrice)}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end font-semibold text-lg">
              Tổng: {fmtCurrency(order.finalPrice ?? total)}₫
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ================= Page ================= */
export default function CustomerOrdersPage() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/by-customer/${user.customerId}`
      );
      setOrders(res.data || []);
    } catch {
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [user.customerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter((o) =>
      o.orderId.toString().includes(searchTerm)
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
        <p className="text-sm text-gray-500">
          Theo dõi các đơn hàng bạn đã đặt
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center bg-white border rounded-xl px-3 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mã đơn hàng"
            className="px-2 py-2 w-full outline-none text-sm"
          />
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          Làm mới
        </button>
      </div>

      {/* Table */}
<div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="p-4 text-left font-semibold text-gray-600">Ngày</th>
        <th className="p-4 text-center font-semibold text-gray-600">Mã</th>
        <th className="p-4 text-right font-semibold text-gray-600">Tổng</th>
        <th className="p-4 text-center font-semibold text-gray-600">
          Trạng thái
        </th>
        <th className="p-4 text-center font-semibold text-gray-600">
          Thao tác
        </th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr>
          <td colSpan={5} className="p-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </td>
        </tr>
      ) : filtered.length === 0 ? (
        <tr>
          <td colSpan={5} className="p-8 text-center text-gray-400">
            Không có đơn hàng
          </td>
        </tr>
      ) : (
        filtered.map((o) => (
          <tr
            key={o.orderId}
            className="border-b last:border-none hover:bg-gray-50 transition"
          >
            <td className="p-4 whitespace-nowrap">
              {safeDate(o.orderDate)}
            </td>

            <td className="p-4 text-center font-medium text-gray-700">
              #{o.orderId}
            </td>

            <td className="p-4 text-right font-semibold">
              {fmtCurrency(o.finalPrice)}₫
            </td>

            <td className="p-4 text-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle(
                  o.statusOrder
                )}`}
              >
                {o.statusOrder}
              </span>
            </td>

            <td className="p-4">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setSelectedOrder(o)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-medium transition"
                >
                  Xem
                </button>

                <button
                  onClick={() => {
                    setSelectedOrder(o);
                    setTimeout(handlePrint, 200);
                  }}
                  className="px-3 py-1.5 border rounded-full hover:bg-gray-100 transition"
                  title="In đơn"
                >
                  <Printer size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        printRef={printRef}
      />
    </div>
  );
}

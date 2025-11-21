// CustomerOrdersPage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, X, User2, MapPin, CalendarDays, BadgeCheck, Clock, Loader, CheckCircle, XCircle, UserRound, UserCheck, Phone, Store, Printer } from "lucide-react";

const fmtCurrency = (v) => Number(v).toLocaleString("vi-VN");
const safeDate = (d) => d ? new Date(d).toLocaleString() : "—";

const OrderModal = ({ order, onClose, printRef }) => {
  if (!order) return null;
  const totalProducts = (order.orderItems || []).reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice ?? 0), 0);
  const discount = Math.max(0, totalProducts - (order.finalPrice ?? totalProducts));
  const finalPrice = order.finalPrice ?? totalProducts;

  return (
    <AnimatePresence>
      {order && (
        <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div ref={printRef} className="bg-white w-full max-w-3xl rounded-3xl shadow relative max-h-[90vh] flex flex-col p-6" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ListChecks /> Chi tiết đơn #{order.orderId}
              </h2>
              <button onClick={onClose}><X /></button>
            </div>
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
              <div><UserRound /> Tài khoản: {order.fullName}</div>
              <div><UserCheck /> Người nhận: {order.fullName}</div>
              <div><Phone /> SĐT: {order.phoneNumber || "—"}</div>
              <div><Store /> Cửa hàng: {order.storeName}</div>
              <div className="col-span-2"><MapPin /> Địa chỉ: {`${order.streetAddress}, ${order.ward}, ${order.district}, ${order.city}`}</div>
              <div><CalendarDays /> Ngày đặt: {safeDate(order.orderDate)}</div>
              <div><BadgeCheck /> Trạng thái: {order.statusOrder}</div>
            </div>
            {/* Products */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">Sản phẩm</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Tên</th>
                    <th className="border px-2 py-1">SL</th>
                    <th className="border px-2 py-1">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((p, i) => (
                    <tr key={i} className="border">
                      <td className="border px-2 py-1 text-center">{i + 1}</td>
                      <td className="border px-2 py-1">{p.productName || "—"}</td>
                      <td className="border px-2 py-1 text-center">{p.quantity}</td>
                      <td className="border px-2 py-1 text-right">{fmtCurrency(p.unitPrice)}₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Total */}
            <div className="flex justify-end gap-4 text-gray-800 font-semibold text-lg">
              <div>Tổng: {fmtCurrency(totalProducts)}₫</div>
              {discount > 0 && <div>Giảm: -{fmtCurrency(discount)}₫</div>}
              <div>Khách trả: {fmtCurrency(finalPrice)}₫</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders/by-customer/1");
        setOrders(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        console.error(err);
        toast.error("Lấy đơn hàng thất bại");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng của khách</h1>
      {loading ? <div>Loading...</div> : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Mã đơn</th>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2">Ngày đặt</th>
              <th className="px-3 py-2">Giá trị</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.orderId} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{o.orderId}</td>
                <td className="px-3 py-2">{o.fullName}</td>
                <td className="px-3 py-2">{safeDate(o.orderDate)}</td>
                <td className="px-3 py-2">{fmtCurrency(o.finalPrice)}₫</td>
                <td className="px-3 py-2">{o.statusOrder}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => setSelectedOrder(o)} className="px-2 py-1 bg-indigo-600 text-white rounded">Xem</button>
                  <button onClick={() => window.print()} className="px-2 py-1 bg-gray-200 rounded"><Printer className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} printRef={printRef} />
    </div>
  );
};

export default CustomerOrdersPage;

// PickupOrdersPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  RefreshCcw,
  List,
  Grid,
  Search,
  X,
  Printer,
  User,
  MapPin,
  Calendar,
  
  ListChecks,
  User2,
  UserRound,
  UserCheck,
  Phone,
  Store,
  
  CalendarDays,
  BadgeCheck,
  Clock,
  Loader,
  CheckCircle,
  XCircle
  
} from "lucide-react";

/* ----------------------------- Constants ----------------------------- */
const PAGE_SIZE = 8;
const STATUS_OPTIONS = ["Pending", "Processing", "Completed", "Cancelled"];
const STATUS_GRADIENT = {
  Pending: "bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 text-yellow-900",
  Processing: "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-blue-900",
  Completed: "bg-gradient-to-r from-green-200 via-green-300 to-green-400 text-green-900",
  Cancelled: "bg-gradient-to-r from-red-200 via-red-300 to-red-400 text-red-900",
};

/* ----------------------------- Helpers ----------------------------- */
const fmtCurrency = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("vi-VN");
};

const safeDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleString();
};

/* ----------------------------- Skeleton ----------------------------- */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    ))}
  </tr>
);

/* ----------------------------- Modal (detailed) ----------------------------- */
const OrderModal = ({ order, customerAddress, onClose, printRef, onPrint }) => {
  if (!order) return null;

  // Tính tổng tạm, discount, final
  const totalProducts = (order.orderItems || []).reduce(
    (sum, item) => sum + (item.totalPrice ?? item.unitPrice ?? 0),
    0
  );
  const finalPrice = order.finalPrice ?? totalProducts;
  const discount = Math.max(0, totalProducts - finalPrice);

  return (
  <AnimatePresence>
    {order && (
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          ref={printRef}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="
            bg-white w-full max-w-3xl rounded-3xl 
            shadow-[0_10px_35px_rgba(0,0,0,0.25)]
            relative border border-gray-100
            max-h-[90vh] flex flex-col
          "
        >

          {/* HEADER */}
          <div
                      className="
                        p-6
                        bg-white 
                        text-gray-800
                        rounded-t-3xl
                        flex justify-between items-center
                        shadow-md
                        border-b
                      "
                    >
                      <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
                        <ListChecks className="w-7 h-7 text-gray-700" />
                        Chi tiết đơn hàng #{order.orderId} - Nhận tại Cửa hàng
                      </h2>
          
                      <button
                        onClick={onClose}
                        className="text-gray-700 hover:text-black transition"
                      >
                        <X className="w-7 h-7" />
                      </button>
                    </div>

          {/* BODY SCROLL */}
          <div
            className="
              p-6 overflow-y-auto
              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
              scrollbar-thumb-rounded-xl
            "
          >

            {/* ==== THÔNG TIN KHÁCH HÀNG ==== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b flex items-center gap-2">
                <User2 className="text-orange-500" size={24} />
                <h3 className="text-lg font-bold text-gray-800">Thông tin khách hàng</h3>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 text-gray-700 text-sm">

                <div className="flex items-start gap-2">
                  <UserRound className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Tài khoản đặt</p>
                    <p>{order.fullName || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <UserCheck className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Người nhận</p>
                    <p>{customerAddress?.receiverName || order.fullName || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Số điện thoại</p>
                    <p>{customerAddress?.phoneNumber || order.phoneNumber || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Store className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Cửa hàng Nhận</p>
                    <p>{order.storeName || "—"}</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Địa chỉ</p>
                    <p className="mt-1">
                      {customerAddress
                        ? `${customerAddress.streetAddress}, ${customerAddress.ward}, ${customerAddress.district}, ${customerAddress.city}`
                        : order.address || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Ngày đặt</p>
                    <p>{safeDate(order.orderDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Trạng thái</p>

                    <span
                      className={`
                        px-3 py-1 mt-1 inline-block
                        rounded-full text-xs font-semibold shadow 
                        ${
                          order.statusOrder === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.statusOrder === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.statusOrder === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {order.statusOrder}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* spacing */}
            <div className="p-2 space-y-8"></div>

            {/* ===== TIMELINE ===== */}
            <div className="bg-white border rounded-2xl shadow-xl p-6">
              <h3 className="flex items-center gap-2 mb-5 text-lg font-bold text-gray-800">
                <div className="text-indigo-500" size={24}/>
                Tiến trình đơn hàng
              </h3>

              {/* LABELS */}
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-4 px-2">

                <div className="flex flex-col items-center">
                  <Clock
                    className={`mb-1 ${
                      order.statusOrder === "Pending"
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
                    size={20}
                  />
                  Chờ xử lý
                </div>

                <div className="flex flex-col items-center">
                  <Loader
                    className={`mb-1 ${
                      order.statusOrder === "Processing"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                    size={20}
                  />
                  Đang xử lý
                </div>

                <div className="flex flex-col items-center">
                  <CheckCircle
                    className={`mb-1 ${
                      order.statusOrder === "Completed"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    size={20}
                  />
                  Hoàn thành
                </div>

                {/* ONLY SHOW IF CANCELLED */}
                {order.statusOrder === "Cancelled" && (
                  <div className="flex flex-col items-center">
                    <XCircle className="mb-1 text-red-600" size={20} />
                    Đã hủy
                  </div>
                )}
              </div>

              {/* PROGRESS BAR */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`
                    absolute top-0 left-0 h-full rounded-full transition-all duration-500
                    ${
                      order.statusOrder === "Pending"
                        ? "w-1/4 bg-yellow-400"
                        : order.statusOrder === "Processing"
                        ? "w-2/4 bg-blue-500"
                        : order.statusOrder === "Completed"
                        ? "w-full bg-green-500"
                        : "w-full bg-red-500"
                    }
                  `}
                />
              </div>

              {/* MARKERS */}
              <div className="flex justify-between mt-3 px-1">

                <div
                  className={`w-4 h-4 rounded-full border shadow ${
                    order.statusOrder === "Pending"
                      ? "bg-yellow-400 border-yellow-700"
                      : "bg-gray-300 border-gray-400"
                  }`}
                />

                <div
                  className={`w-4 h-4 rounded-full border shadow ${
                    order.statusOrder === "Processing"
                      ? "bg-blue-500 border-blue-700"
                      : "bg-gray-300 border-gray-400"
                  }`}
                />

                <div
                  className={`w-4 h-4 rounded-full border shadow ${
                    order.statusOrder === "Completed"
                      ? "bg-green-500 border-green-700"
                      : "bg-gray-300 border-gray-400"
                  }`}
                />

                {order.statusOrder === "Cancelled" && (
                  <div className="w-4 h-4 rounded-full border shadow bg-red-500 border-red-700" />
                )}
              </div>
            </div>

            {/* spacing */}
            <div className="p-2 space-y-8"></div>

            {/* ==== SẢN PHẨM ==== */}
            <div className="bg-white border rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="text-purple-600" size={24}/>
                Sản phẩm
              </h3>

              <div className="rounded-xl border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700 font-medium">
                    <tr>
                      <th className="py-3 px-4 border">#</th>
                      <th className="py-3 px-4 border text-left">Tên sản phẩm</th>
                      <th className="py-3 px-4 border text-center">SL</th>
                      <th className="py-3 px-4 border text-right">Giá</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.orderItems?.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b hover:bg-indigo-50/40 transition-all"
                      >
                        <td className="py-3 px-4 border text-center">{i + 1}</td>
                        <td className="py-3 px-4 border">
                          {p.productName || p.comboName || p.bowlName || "Không rõ"}
                        </td>
                        <td className="py-3 px-4 border text-center">{p.quantity}</td>
                        <td className="py-3 px-4 border text-right">
                          {fmtCurrency(p.unitPrice || p.totalPrice || 0)}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

            {/* ==== TỔNG TIỀN ==== */}
            <div className="mt-8 flex justify-end">
              <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-5 w-80">

                <div className="flex justify-between text-gray-700 mb-2">
                  <span className="font-medium">Tổng tiền sản phẩm:</span>
                  <span>{fmtCurrency(totalProducts)}₫</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-red-600 mb-2">
                    <span className="font-medium">Giảm giá:</span>
                    <span>-{fmtCurrency(discount)}₫</span>
                  </div>
                )}

                <div className="h-px bg-gray-300 my-4" />

                <div className="flex justify-between text-xl font-bold text-green-600">
                  <span>Khách trả:</span>
                  <span>{fmtCurrency(finalPrice)}₫</span>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);


};

/* ----------------------------- Main Component ----------------------------- */
const PickupOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const printRef = useRef(null);
  const mountedRef = useRef(true);

  /* ----------------------------- Fetch orders ----------------------------- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders/filter?type=pickup", { timeout: 10000 });
      if (!mountedRef.current) return;
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) toast.error("Lấy dữ liệu đơn hàng pickup thất bại");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    return () => { mountedRef.current = false; };
  }, [fetchOrders]);

  /* ----------------------------- Debounce search ----------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ----------------------------- Update status (optimistic) ----------------------------- */
  const updateStatus = useCallback(async (orderId, newStatus) => {
    if (!orderId) return;
    setUpdatingStatusId(orderId);
    const prev = orders;
    setOrders((prevList) => prevList.map((o) => (o.orderId === orderId ? { ...o, statusOrder: newStatus } : o)));
    try {
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, { StatusOrder: newStatus }, { timeout: 8000 });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại — hoàn tác");
      setOrders(prev);
    } finally {
      if (mountedRef.current) setUpdatingStatusId(null);
    }
  }, [orders]);

  /* ----------------------------- Selected order -> fetch address ----------------------------- */
  useEffect(() => {
    const fetchAddress = async () => {
      if (!selectedOrder?.customerId) {
        setCustomerAddress(null);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/customeraddresses/by-customer/${selectedOrder.customerId}`, { timeout: 8000 });
        const addr = Array.isArray(res.data) ? (res.data.find(a => a.isDefault) || res.data[0]) : null;
        setCustomerAddress(addr);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải địa chỉ khách hàng");
      }
    };
    fetchAddress();
  }, [selectedOrder]);

  /* ----------------------------- Print ----------------------------- */
  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      toast.error("Không thể mở cửa sổ in (bị chặn bởi trình duyệt).");
      return;
    }
    w.document.write(`
      <html>
        <head><title>In hóa đơn</title>
          <style>
            body{font-family: Arial, sans-serif; padding:20px; color:#111}
            table{border-collapse:collapse;width:100%}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); try { w.close(); } catch (e) {} }, 300);
  }, []);

  /* Support print-request from rows (optional) */
  useEffect(() => {
    const handler = (e) => {
      const { order } = e.detail || {};
      if (!order) return;
      setSelectedOrder(order);
      setTimeout(() => handlePrint(), 450);
    };
    window.addEventListener("print-request", handler);
    return () => window.removeEventListener("print-request", handler);
  }, [handlePrint]);

  /* ----------------------------- Derived data (filter & pagination) ----------------------------- */
  const filtered = useMemo(() => {
    const term = debouncedTerm || "";
    if (!term) return orders;
    return orders.filter((o = {}) => {
      const hay = `${o.orderId ?? ""} ${o.fullName ?? ""} ${o.storeName ?? ""} ${o.orderItems?.map(i=>i.productName).join(" ") ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [orders, debouncedTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  useEffect(() => { setPage(1); }, [debouncedTerm]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const current = useMemo(() => filtered.slice(startIndex, startIndex + PAGE_SIZE), [filtered, startIndex]);

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        {/* <div className="flex items-center gap-3">
          <Building2 className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Đơn Nhận tại Cửa hàng</h1>
            <p className="text-sm text-gray-500">Quản lý đơn pickup — VIP PRO</p>
          </div>
        </div> */}
        <div className="flex items-center gap-3">
          <Building2 className="w-10 h-10 text-blue-600 animate-bounce" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              Đơn hàng Nhận tại cửa hàng 
            </h1>
            <p className="text-sm text-gray-500">Quản lý đơn pickup — VIP PRO</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              className="px-4 py-2 w-full outline-none bg-transparent text-sm"
              placeholder="Tìm mã đơn, tên khách, cửa hàng, sản phẩm..."
            />
            <div className="px-3 text-gray-500"><Search size={18} /></div>
          </div>

          <button
            onClick={fetchOrders}
            className="ml-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
            title="Làm mới"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-sm">Làm mới</span>
          </button>

          <div className="ml-2 flex items-center gap-2 border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto bg-white rounded-2xl shadow p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left">Mã đơn</th>
                  <th className="py-2 px-3 text-left">Khách hàng</th>
                  <th className="py-2 px-3 text-left">Cửa hàng</th>
                  <th className="py-2 px-3 text-left">Ngày đặt</th>
                  <th className="py-2 px-3 text-left">Giá trị</th>
                  <th className="py-2 px-3 text-left">Trạng thái</th>
                  <th className="py-2 px-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div key="table" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18 }} className="overflow-x-auto bg-white rounded-2xl shadow p-2">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-3 text-left">Mã đơn</th>
                  <th className="py-3 px-3 text-left">Khách hàng</th>
                  <th className="py-3 px-3 text-left">Cửa hàng</th>
                  <th className="py-3 px-3 text-left">Ngày đặt</th>
                  <th className="py-3 px-3 text-left">Giá trị</th>
                  <th className="py-3 px-3 text-left">Trạng thái</th>
                  <th className="py-3 px-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {current.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">Không có đơn hàng.</td>
                  </tr>
                ) : current.map((o) => (
                  <tr key={o.orderId} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-3 font-semibold">{o.orderId}</td>
                    <td className="py-3 px-3">{o.fullName}</td>
                    <td className="py-3 px-3">{o.storeName}</td>
                    <td className="py-3 px-3">{safeDate(o.orderDate)}</td>
                    <td className="py-3 px-3 font-semibold">{fmtCurrency(o.finalPrice)}₫</td>
                    <td className="py-3 px-3">
                      <motion.span layout className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_GRADIENT[o.statusOrder]}`}>
                        {o.statusOrder}
                      </motion.span>
                    </td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <select
                        value={o.statusOrder}
                        onChange={(e) => updateStatus(o.orderId, e.target.value)}
                        className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm shadow"
                      >
                        Xem
                      </button>

                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent("print-request", { detail: { order: o } }))}
                        className="px-2 py-1 bg-white border rounded-full text-sm shadow"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {current.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500 bg-white rounded-2xl shadow">Không có đơn hàng.</div>
            ) : current.map((o) => (
              <motion.div key={o.orderId} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Mã đơn</div>
                    <div className="text-lg font-bold">{o.orderId}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_GRADIENT[o.statusOrder]}`}>
                    {o.statusOrder}
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> {o.fullName || "—"}</div>
                  <div className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {o.storeName || "—"}</div>
                  <div className="flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> {safeDate(o.orderDate)}</div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-lg font-extrabold text-gray-800">{fmtCurrency(o.finalPrice)}₫</div>
                  <div className="flex items-center gap-2">
                    <select value={o.statusOrder} onChange={(e) => updateStatus(o.orderId, e.target.value)} className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setSelectedOrder(o)} className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">Xem</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-gray-600">
          Hiển thị <span className="font-bold text-blue-600">{Math.min(filtered.length, page * PAGE_SIZE)}</span> / {filtered.length} bản ghi
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 rounded-full border bg-white">« Đầu</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-full border bg-white">‹</button>
          <span className="px-3 py-1">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-full border bg-white">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 rounded-full border bg-white">Cuối »</button>
        </div>
      </div>

      {/* Modal */}
      <OrderModal
        order={selectedOrder}
        customerAddress={customerAddress}
        onClose={() => setSelectedOrder(null)}
        printRef={printRef}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default PickupOrdersPage;

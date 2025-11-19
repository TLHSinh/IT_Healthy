// ShippingOrdersPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  RefreshCcw,
  List,
  Grid,
  Search,
  X,
  Printer,
  Filter,
  MapPin,
  User,
  Calendar,
  Building2,Clock, Loader, CheckCircle,Package, ListChecks, User2, UserRound, Timer,
  UserCheck,
  Phone,
  Store,
  CalendarDays,
  BadgeCheck,XCircle
} from "lucide-react";

/* ----------------------------- Constants ----------------------------- */
const PAGE_SIZE = 8;
const STATUS_OPTIONS = ["All", "Pending", "Processing", "Completed", "Cancelled"];
const STATUS_STYLES = {
  Pending: "bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500 text-yellow-900 shadow-sm",
  Processing: "bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 text-blue-900 shadow-sm",
  Completed: "bg-gradient-to-r from-green-100 via-green-300 to-green-500 text-green-900 shadow-sm",
  Cancelled: "bg-gradient-to-r from-red-100 via-red-300 to-red-500 text-red-900 shadow-sm",
  Unknown: "bg-gray-100 text-gray-800 shadow-sm",
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
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    ))}
  </tr>
);

/* ----------------------------- Subcomponents ----------------------------- */
const OrderRow = React.memo(({ order, index, startIndex, onUpdateStatus, onView, updating }) => {
  const id = order?.orderId ?? `tmp-${startIndex + index}`;
  const status = order?.statusOrder ?? "Unknown";
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="py-3 px-3">{startIndex + index + 1}</td>
      <td className="py-3 px-3 font-semibold">{id}</td>
      <td className="py-3 px-3">{order?.fullName || "—"}</td>
      <td className="py-3 px-3">{order?.storeName || "—"}</td>
      <td className="py-3 px-3">{safeDate(order?.orderDate)}</td>
      <td className="py-3 px-3 font-semibold">{fmtCurrency(order?.finalPrice ?? 0)}₫</td>
      <td className="py-3 px-3">
        <motion.span
          layout
          className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.Unknown}`}
        >
          {status}
        </motion.span>
      </td>
      <td className="py-3 px-3 flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onUpdateStatus(order?.orderId, e.target.value)}
          disabled={updating}
          className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm"
        >
          {["Pending", "Processing", "Completed", "Cancelled"].map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <button
          onClick={() => onView(order)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm shadow"
          title="Xem chi tiết"
        >
          Xem
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("print-request", { detail: { order } }))}
          className="px-2 py-1 bg-white border rounded-full text-sm shadow"
          title="In hóa đơn"
        >
          <Printer className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
OrderRow.displayName = "OrderRow";

const OrderCard = React.memo(({ order, onUpdateStatus, onView, updating }) => {
  const status = order?.statusOrder ?? "Unknown";
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm text-gray-500">Mã đơn</div>
          <div className="text-lg font-bold">{order?.orderId || "—"}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.Unknown}`}>{status}</div>
      </div>
      <div className="text-sm text-gray-700 mb-2">
        <div className="flex items-center gap-2"><User className="w-4 h-4" /> {order?.fullName || "—"}</div>
        <div className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {order?.storeName || "—"}</div>
        <div className="flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> {safeDate(order?.orderDate)}</div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-lg font-extrabold text-gray-800">{fmtCurrency(order?.finalPrice ?? 0)}₫</div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => onUpdateStatus(order?.orderId, e.target.value)} disabled={updating} className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm">
            {["Pending", "Processing", "Completed", "Cancelled"].map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button onClick={() => onView(order)} className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">Xem</button>
        </div>
      </div>
    </motion.div>
  );
});
OrderCard.displayName = "OrderCard";

/* ----------------------------- Modal ----------------------------- */
/* ----------------------------- Modal ----------------------------- */
const OrderModal = ({ order, customerAddress, onClose, printRef, onPrint }) => {

  if (!order) return null;

  // ============================
  //  TÍNH TỔNG HÓA ĐƠN + DISCOUNT
  // ============================
  const totalProducts = (order.orderItems || []).reduce(
    (sum, item) => sum + (item.totalPrice || item.unitPrice || 0),
    0
  );

  const finalPrice = order.finalPrice || totalProducts;
  const discount = totalProducts - finalPrice;


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
              Chi tiết đơn hàng #{order.orderId} - Giao Nhận (COD)
            </h2>

            <button
              onClick={onClose}
              className="text-gray-700 hover:text-black transition"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* BODY (Scroll) */}
          <div
            className="
              p-6 overflow-y-auto
              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
              scrollbar-thumb-rounded-xl
            "
          >

            {/* Thông tin khách hàng */}
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
                    <p className="font-semibold">Cửa hàng</p>
                    <p>{order.storeName || "—"}</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 text-gray-500" size={18}/>
                  <div>
                    <p className="font-semibold">Địa chỉ giao hàng</p>
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
                            : "bg-green-100 text-green-700"
                        }
                      `}
                    >
                      {order.statusOrder}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-2 space-y-8"></div>

            {/* TIMELINE */}
<div className="bg-white border rounded-2xl shadow-xl p-6">
  <h3 className="flex items-center gap-2 mb-5 text-lg font-bold text-gray-800">
    <div className="text-indigo-500" size={24}/>
    Tiến trình đơn hàng
  </h3>

  {(() => {
    const isCancelled = order.statusOrder === "Cancelled";

    return (
      <>
        {/* ===== LABELS ===== */}
        <div className="flex justify-between text-xs font-medium text-gray-600 mb-4 px-2">

          {/* Pending */}
          <div className="flex flex-col items-center">
            <Clock
              className={`mb-1 ${
                order.statusOrder === "Pending" ? "text-yellow-500" : "text-gray-400"
              }`}
              size={20}
            />
            Chờ xử lý
          </div>

          {/* Processing */}
          <div className="flex flex-col items-center">
            <Loader
              className={`mb-1 ${
                order.statusOrder === "Processing" ? "text-blue-500" : "text-gray-400"
              }`}
              size={20}
            />
            Đang xử lý
          </div>

          {/* Completed */}
          <div className="flex flex-col items-center">
            <CheckCircle
              className={`mb-1 ${
                order.statusOrder === "Completed" ? "text-green-600" : "text-gray-400"
              }`}
              size={20}
            />
            Hoàn thành
          </div>

          {/* ONLY show Cancel WHEN actual cancelled */}
          {isCancelled && (
            <div className="flex flex-col items-center">
              <XCircle
                className={`mb-1 text-red-600`}
                size={20}
              />
              Đã hủy
            </div>
          )}
        </div>

        {/* ===== PROGRESS BAR ===== */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`
            absolute top-0 left-0 h-full rounded-full transition-all duration-500
            ${
              order.statusOrder === "Pending"
                ? isCancelled ? "w-1/4 bg-yellow-400" : "w-1/3 bg-yellow-400"
              : order.statusOrder === "Processing"
                ? isCancelled ? "w-2/4 bg-blue-500" : "w-2/3 bg-blue-500"
              : order.statusOrder === "Completed"
                ? isCancelled ? "w-3/4 bg-green-500" : "w-full bg-green-500"
              : "w-full bg-red-500"
            }
          `}
          />
        </div>

        {/* ===== DOTS ===== */}
        <div className="flex justify-between mt-3 px-1">

          {/* Pending */}
          <div
            className={`w-4 h-4 rounded-full border shadow ${
              order.statusOrder === "Pending"
                ? "bg-yellow-400 border-yellow-700"
                : "bg-gray-300 border-gray-400"
            }`}
          />

          {/* Processing */}
          <div
            className={`w-4 h-4 rounded-full border shadow ${
              order.statusOrder === "Processing"
                ? "bg-blue-500 border-blue-700"
                : "bg-gray-300 border-gray-400"
            }`}
          />

          {/* Completed */}
          <div
            className={`w-4 h-4 rounded-full border shadow ${
              order.statusOrder === "Completed"
                ? "bg-green-500 border-green-700"
                : "bg-gray-300 border-gray-400"
            }`}
          />

          {/* Cancelled dot — ONLY when cancelled */}
          {isCancelled && (
            <div
              className={`w-4 h-4 rounded-full border shadow bg-red-500 border-red-700`}
            />
          )}
        </div>
      </>
    );
  })()}
</div>


            <div className="p-2 space-y-8"></div>

            {/* SẢN PHẨM */}
            <div className="bg-white border rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="text-purple-600 " size={24}/>
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

            


            {/* ====== TỔNG TIỀN ====== */}
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
const ShippingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const printRef = useRef(null);
  const mountedRef = useRef(true);
  const [customerAddress, setCustomerAddress] = useState(null);

  useEffect(() => {
  const fetchAddress = async () => {
    if (!selectedOrder?.customerId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/customeraddresses/by-customer/${selectedOrder.customerId}`
      );

      const addr = Array.isArray(res.data)
        ? res.data.find(a => a.isDefault) || res.data[0]
        : null;

      setCustomerAddress(addr);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải địa chỉ khách hàng");
    }
  };

  fetchAddress();
}, [selectedOrder]);

  /* ----------------------------- Fetch ----------------------------- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders/filter?type=shipping", { timeout: 10000 });
      if (!mountedRef.current) return;
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) toast.error("Lấy dữ liệu đơn hàng thất bại");
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

  /* ----------------------------- Update Status (optimistic) ----------------------------- */
  const updateStatus = useCallback(async (orderId, newStatus) => {
    if (!orderId) return;
    setUpdatingStatusId(orderId);
    // optimistic update
    const prev = orders;
    setOrders((prevList) => prevList.map((o) => (o.orderId === orderId ? { ...o, statusOrder: newStatus } : o)));
    try {
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, { StatusOrder: newStatus }, { timeout: 8000 });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại — hoàn tác");
      // rollback
      setOrders(prev);
    } finally {
      if (mountedRef.current) setUpdatingStatusId(null);
    }
  }, [orders]);

  /* ----------------------------- Derived Data ----------------------------- */
  const filtered = useMemo(() => {
    const term = debouncedTerm || "";
    return orders.filter((o = {}) => {
      const matchStatus = statusFilter === "All" || (o.statusOrder || "Unknown") === statusFilter;
      if (!term) return matchStatus;
      const hay = `${o.orderId ?? ""} ${o.fullName ?? ""} ${o.storeName ?? ""} ${o.phoneNumber ?? ""}`.toLowerCase();
      return matchStatus && hay.includes(term);
    });
  }, [orders, debouncedTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]); // reset page if out of range
  useEffect(() => { setPage(1); }, [debouncedTerm, statusFilter]); // reset page on filter/search changes

  const startIndex = (page - 1) * PAGE_SIZE;
  const current = useMemo(() => filtered.slice(startIndex, startIndex + PAGE_SIZE), [filtered, startIndex]);

  /* ----------------------------- Print ----------------------------- */
  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      toast.error("Không thể mở cửa sổ in (bị chặn bởi trình duyệt).");
      return;
    }
    w.document.write(`
      <html>
        <head>
          <title>In hóa đơn</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            .border { border:1px solid #ddd; }
            table { border-collapse: collapse; width: 100%; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    // allow browser to render content before print
    setTimeout(() => {
      w.print();
      try { w.close(); } catch (e) { /* ignore */ }
    }, 250);
  }, []);

  /* Allow row print buttons to request printing the currently shown modal content */
  useEffect(() => {
    const handler = (e) => {
      const { order } = e.detail || {};
      if (!order) return;
      setSelectedOrder(order);
      // ensure modal renders then trigger print after short delay
      setTimeout(() => handlePrint(), 450);
    };
    window.addEventListener("print-request", handler);
    return () => window.removeEventListener("print-request", handler);
  }, [handlePrint]);

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-10 h-10 text-green-600 animate-bounce" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              Đơn hàng Giao - Nhận (COD)
            </h1>
            <p className="text-sm text-gray-500">Quản lý đơn shipping — VIP PRO</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-center w-full sm:w-80 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              className="px-4 py-2 w-full outline-none bg-transparent text-sm"
              placeholder="Tìm mã đơn, tên khách, cửa hàng, số điện thoại..."
            />
            <div className="px-3 text-gray-500"><Search size={18} /></div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1 ml-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              className="outline-none bg-transparent text-sm px-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
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
              className={`px-3 py-2 ${viewMode === "table" ? "bg-green-600 text-white" : "bg-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 ${viewMode === "card" ? "bg-green-600 text-white" : "bg-white"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto bg-white rounded-2xl shadow p-4"
          >
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left">#</th>
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
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="overflow-x-auto bg-white rounded-2xl shadow p-2"
          >
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-3 text-left">#</th>
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
                    <td colSpan={8} className="p-6 text-center text-gray-500">Không có đơn hàng.</td>
                  </tr>
                ) : current.map((order, idx) => (
                  <OrderRow
                    key={order?.orderId ?? `row-${idx}`}
                    order={order}
                    index={idx}
                    startIndex={startIndex}
                    onUpdateStatus={updateStatus}
                    onView={(o) => setSelectedOrder(o)}
                    updating={updatingStatusId === (order?.orderId)}
                  />
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          // Card view
          <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {current.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500 bg-white rounded-2xl shadow">Không có đơn hàng.</div>
            ) : current.map((ord) => (
              <OrderCard
                key={ord.orderId ?? `card-${Math.random()}`}
                order={ord}
                onUpdateStatus={updateStatus}
                onView={(o) => setSelectedOrder(o)}
                updating={updatingStatusId === (ord?.orderId)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-gray-600">
          Hiển thị <span className="font-bold text-green-600">{Math.min(filtered.length, page * PAGE_SIZE)}</span> / {filtered.length} bản ghi
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 rounded-full border bg-white">« Đầu</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-full border bg-white">‹</button>
          <span className="px-3 py-1">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-full border bg-white">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 rounded-full border bg-white">Cuối »</button>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedOrder && (
  <OrderModal
    order={selectedOrder}
    customerAddress={customerAddress}
    onClose={() => setSelectedOrder(null)}
    printRef={printRef}
    onPrint={handlePrint}
  />
)}

    </div>
  );
};

export default ShippingOrdersPage;

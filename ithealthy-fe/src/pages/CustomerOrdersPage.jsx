// CustomerOrdersPage.jsx
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
  Grid,
  Search,
  X,
  RefreshCcw,
  Printer,
  Filter,
  MapPin,
  User,
  Calendar,
  Store,
  Phone,
  BadgeCheck,
  ListChecks,
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

/* ----------------------------- Constants ----------------------------- */
const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES = {
  Pending:
    "bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500 text-yellow-900 shadow-sm",
  Processing:
    "bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 text-blue-900 shadow-sm",
  Completed:
    "bg-gradient-to-r from-green-100 via-green-300 to-green-500 text-green-900 shadow-sm",
  Cancelled:
    "bg-gradient-to-r from-red-100 via-red-300 to-red-500 text-red-900 shadow-sm",
  Unknown: "bg-gray-100 text-gray-800 shadow-sm",
};

const ORDER_TYPE_OPTIONS = ["All", "Shipping", "Pickup"];

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

/* ----------------------------- Skeleton Row ----------------------------- */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ----------------------------- Row & Card ----------------------------- */
const OrderRow = React.memo(({ order, index, startIndex, onView, onPrint }) => {
  const id = order?.orderId ?? `tmp-${startIndex + index}`;
  const status = order?.statusOrder ?? "Unknown";
  const typeLabel =
    (order?.orderType || "").toLowerCase() === "shipping"
      ? "Shipping"
      : (order?.orderType || "").toLowerCase() === "pickup"
      ? "Pickup"
      : order?.orderType || "—";

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="py-3 px-3 text-center">{startIndex + index + 1}</td>
      <td className="py-3 px-3 font-semibold">{id}</td>
      <td className="py-3 px-3">{order?.storeName || "—"}</td>
      <td className="py-3 px-3">{typeLabel}</td>
      <td className="py-3 px-3">{safeDate(order?.orderDate)}</td>
      <td className="py-3 px-3 font-semibold">
        {fmtCurrency(order?.finalPrice ?? 0)}₫
      </td>
      <td className="py-3 px-3">
        <motion.span
          layout
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            STATUS_STYLES[status] ?? STATUS_STYLES.Unknown
          }`}
        >
          {status}
        </motion.span>
      </td>
      <td className="py-3 px-3 text-center">
        <button
          onClick={() => onView(order)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs shadow mr-2"
        >
          Xem
        </button>
        <button
          onClick={() => onPrint(order)}
          className="px-2 py-1 bg-white border rounded-full text-xs shadow"
          title="In hóa đơn"
        >
          <Printer className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
OrderRow.displayName = "OrderRow";

const OrderCard = React.memo(({ order, onView, onPrint }) => {
  const status = order?.statusOrder ?? "Unknown";
  const typeLabel =
    (order?.orderType || "").toLowerCase() === "shipping"
      ? "Shipping"
      : (order?.orderType || "").toLowerCase() === "pickup"
      ? "Pickup"
      : order?.orderType || "—";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-gray-500">Mã đơn</div>
          <div className="text-lg font-bold">{order?.orderId || "—"}</div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            STATUS_STYLES[status] ?? STATUS_STYLES.Unknown
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-700 mb-2 space-y-1">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4" /> {order?.storeName || "—"}
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" /> {typeLabel}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" /> {safeDate(order?.orderDate)}
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" />{" "}
          {fmtCurrency(order?.finalPrice ?? 0)}₫
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-lg font-extrabold text-gray-800">
          {fmtCurrency(order?.finalPrice ?? 0)}₫
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(order)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs"
          >
            Xem
          </button>
          <button
            onClick={() => onPrint(order)}
            className="px-2 py-1 bg-white border rounded-full text-xs shadow"
            title="In hóa đơn"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});
OrderCard.displayName = "OrderCard";

/* ----------------------------- Modal ----------------------------- */
const OrderModal = ({
  order,
  onClose,
  printRef,
  shippingAddress,
  loadingAddress,
}) => {
  if (!order) return null;

  const totalProducts = (order.orderItems || []).reduce(
    (sum, item) => sum + (item.totalPrice || item.unitPrice || 0),
    0
  );
  const finalPrice = order.finalPrice || totalProducts;
  const discount = Math.max(0, totalProducts - finalPrice);

  const isShipping = (order.orderType || "").toLowerCase() === "shipping";
  const isCancelled = order.statusOrder === "Cancelled";

  // Địa chỉ pickup – tùy theo DTO mà bạn có thể map lại
  const pickupAddress = order.storeStreetAddress
    ? `${order.storeStreetAddress}${
        order.storeWard ? `, ${order.storeWard}` : ""
      }${order.storeDistrict ? `, ${order.storeDistrict}` : ""}${
        order.storeCity ? `, ${order.storeCity}` : ""
      }`
    : order.storeAddress || order.storeName || "";

  const shippingFullAddress =
    shippingAddress &&
    [
      shippingAddress.streetAddress,
      shippingAddress.ward,
      shippingAddress.district,
      shippingAddress.city,
    ]
      .filter(Boolean)
      .join(", ");

  const receiverName = isShipping
    ? shippingAddress?.receiverName || order.fullName || "—"
    : order.fullName || "—";

  const receiverPhone = isShipping
    ? shippingAddress?.phoneNumber || order.phoneNumber || "—"
    : order.phoneNumber || "—";

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
              max-h-[75vh] flex flex-col
            "
          >
            {/* HEADER */}
            <div
              className="
                p-6 bg-white text-gray-800 rounded-t-3xl
                flex justify-between items-center shadow-md border-b
              "
            >
              <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
                <ListChecks className="w-7 h-7 text-gray-700" />
                Chi tiết đơn hàng #{order.orderId}
              </h2>

              <button
                onClick={onClose}
                className="text-gray-700 hover:text-black transition"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* BODY */}
            <div
              className="
                p-6 overflow-y-auto
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                scrollbar-thumb-rounded-xl
              "
            >
              {/* Thông tin chung + địa chỉ */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b flex items-center gap-2">
                  <User className="text-orange-500" size={24} />
                  <h3 className="text-lg font-bold text-gray-800">
                    Thông tin đơn hàng & giao / nhận
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 text-gray-700 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Tài khoản đặt</p>
                      <p>{order.fullName || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Số điện thoại</p>
                      <p>{receiverPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Người nhận</p>
                      <p>{receiverName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Truck className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Hình thức</p>
                      <p>
                        {isShipping
                          ? "Giao hàng (Shipping)"
                          : "Nhận tại cửa hàng (Pickup)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Store className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Cửa hàng</p>
                      <p>{order.storeName || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Ngày đặt</p>
                      <p>{safeDate(order.orderDate)}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="mt-0.5 text-gray-500" size={18} />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {isShipping
                          ? "Địa chỉ giao hàng"
                          : "Địa chỉ cửa hàng pickup"}
                      </p>
                      {isShipping ? (
                        loadingAddress ? (
                          <p className="mt-1 text-xs text-gray-500 italic">
                            Đang tải địa chỉ giao hàng...
                          </p>
                        ) : (
                          <p className="mt-1">{shippingFullAddress || "—"}</p>
                        )
                      ) : (
                        <p className="mt-1">{pickupAddress || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 text-gray-500" size={18} />
                    <div>
                      <p className="font-semibold">Trạng thái</p>
                      <span
                        className={`
                          px-3 py-1 mt-1 inline-block rounded-full text-xs font-semibold shadow 
                          ${
                            order.statusOrder === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.statusOrder === "Processing"
                              ? "bg-blue-100 text-blue-700"
                              : order.statusOrder === "Completed"
                              ? "bg-green-100 text-green-700"
                              : order.statusOrder === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                      >
                        {order.statusOrder}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2" />

              {/* TIMELINE */}
              <div className="bg-white border rounded-2xl shadow-xl p-6 mt-4">
                <h3 className="flex items-center gap-2 mb-5 text-lg font-bold text-gray-800">
                  <div className="text-indigo-500">
                    <Clock size={24} />
                  </div>
                  Tiến trình đơn hàng
                </h3>

                <>
                  {/* Labels */}
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

                    {isCancelled && (
                      <div className="flex flex-col items-center">
                        <XCircle className="mb-1 text-red-600" size={20} />
                        Đã hủy
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`
                        absolute top-0 left-0 h-full rounded-full transition-all duration-500
                        ${
                          order.statusOrder === "Pending"
                            ? isCancelled
                              ? "w-1/4 bg-yellow-400"
                              : "w-1/3 bg-yellow-400"
                            : order.statusOrder === "Processing"
                            ? isCancelled
                              ? "w-2/4 bg-blue-500"
                              : "w-2/3 bg-blue-500"
                            : order.statusOrder === "Completed"
                            ? isCancelled
                              ? "w-3/4 bg-green-500"
                              : "w-full bg-green-500"
                            : "w-full bg-red-500"
                        }
                      `}
                    />
                  </div>

                  {/* Dots */}
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
                    {isCancelled && (
                      <div className="w-4 h-4 rounded-full border shadow bg-red-500 border-red-700" />
                    )}
                  </div>
                </>
              </div>

              <div className="p-2" />

              {/* SẢN PHẨM */}
              <div className="bg-white border rounded-2xl shadow-xl p-6 mt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="text-purple-600">
                    <List size={20} />
                  </div>
                  Sản phẩm
                </h3>

                <div className="rounded-xl border overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-medium">
                      <tr>
                        <th className="py-3 px-4 border">#</th>
                        <th className="py-3 px-4 border text-left">
                          Tên sản phẩm
                        </th>
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
                          <td className="py-3 px-4 border text-center">
                            {i + 1}
                          </td>
                          <td className="py-3 px-4 border">
                            {p.productName ||
                              p.comboName ||
                              p.bowlName ||
                              "Không rõ"}
                          </td>
                          <td className="py-3 px-4 border text-center">
                            {p.quantity}
                          </td>
                          <td className="py-3 px-4 border text-right">
                            {fmtCurrency(p.unitPrice || p.totalPrice || 0)}₫
                          </td>
                        </tr>
                      ))}
                      {(!order.orderItems || order.orderItems.length === 0) && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-3 px-4 border text-center text-gray-500"
                          >
                            Không có sản phẩm trong đơn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TỔNG TIỀN */}
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

/* ----------------------------- Main Page ----------------------------- */
const CustomerOrdersPage = () => {
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All");

  const [page, setPage] = useState(1);

  const [shippingAddress, setShippingAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const printRef = useRef(null);
  const mountedRef = useRef(true);

  /* ----------------------------- Fetch Orders (by customer only) ----------------------------- */
  const fetchOrders = useCallback(async () => {
    if (!user?.customerId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/by-customer/${user.customerId}`,
        { timeout: 10000 }
      );
      if (!mountedRef.current) return;
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) toast.error("Không thể tải đơn hàng");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchOrders]);

  /* ----------------------------- Debounce search ----------------------------- */
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedTerm(searchTerm.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ----------------------------- Filtered data (status + type + search) ----------------------------- */
  const filtered = useMemo(() => {
    const term = debouncedTerm || "";
    return orders.filter((o = {}) => {
      const matchStatus =
        statusFilter === "All" || (o.statusOrder || "Unknown") === statusFilter;

      const matchType =
        orderTypeFilter === "All" ||
        (o.orderType || "")
          .toLowerCase()
          .includes(orderTypeFilter.toLowerCase());

      if (!term) return matchStatus && matchType;

      const hay = `${o.orderId ?? ""} ${o.storeName ?? ""} ${
        o.statusOrder ?? ""
      } ${o.orderType ?? ""}`.toLowerCase();

      return matchStatus && matchType && hay.includes(term);
    });
  }, [orders, debouncedTerm, statusFilter, orderTypeFilter]);

  /* ----------------------------- Pagination ----------------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;

  const current = useMemo(
    () => filtered.slice(startIndex, startIndex + PAGE_SIZE),
    [filtered, startIndex]
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedTerm, statusFilter, orderTypeFilter]);

  /* ----------------------------- Fetch shipping address when open modal ----------------------------- */
  useEffect(() => {
    const fetchAddress = async () => {
      if (!selectedOrder) {
        setShippingAddress(null);
        return;
      }

      if ((selectedOrder.orderType || "").toLowerCase() !== "shipping") {
        setShippingAddress(null);
        return;
      }

      try {
        setLoadingAddress(true);
        const res = await axios.get(
          `http://localhost:5000/api/orders/address-by-order/${selectedOrder.orderId}`,
          { timeout: 8000 }
        );
        setShippingAddress(res.data || null);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải địa chỉ giao hàng");
        setShippingAddress(null);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [selectedOrder]);

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
    setTimeout(() => {
      w.print();
      try {
        w.close();
      } catch (e) {}
    }, 250);
  }, []);

  const handlePrintOrder = (order) => {
    setSelectedOrder(order);
    setTimeout(() => handlePrint(), 450);
  };

  /* ----------------------------- Guard: require login ----------------------------- */
  if (!user) {
    return (
      <div className="p-6 bg-[#F8F4E9] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-600">
          Vui lòng đăng nhập để xem đơn hàng của bạn.
        </div>
      </div>
    );
  }

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="p-6 bg-[#F8F4E9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-gray-500">
            Theo dõi và quản lý lịch sử đơn hàng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-center w-full sm:w-64 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 w-full outline-none bg-transparent text-sm"
              placeholder="Tìm mã đơn, cửa hàng, trạng thái..."
            />
            <div className="px-3 text-gray-500">
              <Search size={18} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              className="outline-none bg-transparent text-sm px-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Order type Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1">
            <Truck className="w-4 h-4 text-gray-600" />
            <select
              className="outline-none bg-transparent text-sm px-2"
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
            >
              {ORDER_TYPE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "Tất cả loại" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
            title="Làm mới"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-sm">Làm mới</span>
          </button>

          {/* View mode */}
          <div className="flex items-center gap-2 border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 ${
                viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 ${
                viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white"
              }`}
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
                  <th className="py-2 px-3 text-center">#</th>
                  <th className="py-2 px-3 text-left">Mã đơn</th>
                  <th className="py-2 px-3 text-left">Cửa hàng</th>
                  <th className="py-2 px-3 text-left">Hình thức</th>
                  <th className="py-2 px-3 text-left">Ngày đặt</th>
                  <th className="py-2 px-3 text-left">Giá trị</th>
                  <th className="py-2 px-3 text-left">Trạng thái</th>
                  <th className="py-2 px-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
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
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-3 text-center">#</th>
                  <th className="py-3 px-3 text-left">Mã đơn</th>
                  <th className="py-3 px-3 text-left">Cửa hàng</th>
                  <th className="py-3 px-3 text-left">Hình thức</th>
                  <th className="py-3 px-3 text-left">Ngày đặt</th>
                  <th className="py-3 px-3 text-left">Giá trị</th>
                  <th className="py-3 px-3 text-left">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {current.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-6 text-center text-gray-500 text-sm"
                    >
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  current.map((order, idx) => (
                    <OrderRow
                      key={order?.orderId ?? `row-${idx}`}
                      order={order}
                      index={idx}
                      startIndex={startIndex}
                      onView={(o) => setSelectedOrder(o)}
                      onPrint={handlePrintOrder}
                    />
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {current.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500 bg-white rounded-2xl shadow">
                Không có đơn hàng nào.
              </div>
            ) : (
              current.map((ord) => (
                <OrderCard
                  key={ord.orderId ?? `card-${Math.random()}`}
                  order={ord}
                  onView={(o) => setSelectedOrder(o)}
                  onPrint={handlePrintOrder}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-gray-600 text-sm">
          Hiển thị{" "}
          <span className="font-bold text-indigo-600">
            {Math.min(filtered.length, page * PAGE_SIZE)}
          </span>{" "}
          / {filtered.length} đơn hàng
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            « Đầu
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            ‹
          </button>
          <span className="px-3 py-1">
            {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-full border bg-white disabled:opacity-50"
          >
            Cuối »
          </button>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          printRef={printRef}
          shippingAddress={shippingAddress}
          loadingAddress={loadingAddress}
        />
      )}
    </div>
  );
};

export default CustomerOrdersPage;

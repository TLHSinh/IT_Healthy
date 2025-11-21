// BowlPage.jsx
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
  Printer,
  RefreshCcw,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
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
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ----------------------------- Modal ----------------------------- */
const BowlModal = ({ bowl, onClose, printRef }) => {
  if (!bowl) return null;

  return (
    <AnimatePresence>
      {bowl && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            ref={printRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{bowl.bowlName}</h2>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between text-gray-700">
                <div>Tổng giá:</div>
                <div className="font-semibold">
                  {fmtCurrency(bowl.totalPrice)}₫
                </div>
              </div>
              <div className="flex justify-between text-gray-700">
                <div>Calories:</div>
                <div className="font-semibold">{bowl.baseCalories}</div>
              </div>
              <div className="flex justify-between text-gray-700">
                <div>Protein:</div>
                <div className="font-semibold">{bowl.totalProtein}g</div>
              </div>
              <div className="flex justify-between text-gray-700">
                <div>Carbs:</div>
                <div className="font-semibold">{bowl.totalCarbs}g</div>
              </div>
              <div className="flex justify-between text-gray-700">
                <div>Fat:</div>
                <div className="font-semibold">{bowl.totalFat}g</div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Nguyên liệu</h3>
                <div className="rounded-xl border overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 font-medium">
                      <tr>
                        <th className="py-2 px-4">#</th>
                        <th className="py-2 px-4 text-left">Tên nguyên liệu</th>
                        <th className="py-2 px-4 text-center">SL</th>
                        <th className="py-2 px-4 text-right">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bowl.ingredients.map((ing, i) => (
                        <tr
                          key={i}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-2 px-4 text-center">{i + 1}</td>
                          <td className="py-2 px-4">{ing.ingredientName}</td>
                          <td className="py-2 px-4 text-center">
                            {ing.quantity}
                          </td>
                          <td className="py-2 px-4 text-right">
                            {fmtCurrency(ing.price)}₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
const BowlPage = () => {
  const [bowls, setBowls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [selectedBowl, setSelectedBowl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const { user } = useContext(AuthContext);

  /* Fetch bowls */
  const fetchBowls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bowl/user/${user.customerId}`
      );
      setBowls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Lấy dữ liệu bowl thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBowls();
  }, [fetchBowls]);

  const filtered = useMemo(() => {
    if (!searchTerm) return bowls;
    return bowls.filter((b) =>
      b.bowlName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bowls, searchTerm]);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(
      `<html><head><title>In Bowl</title></head><body>${printRef.current.innerHTML}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      try {
        w.close();
      } catch (e) {}
    }, 300);
  }, []);

  const handleAddToCart = async (bowl) => {
    if (!bowl) return;

    try {
      await axios.post(
        `http://localhost:5000/api/bowl/clone-to-cart/${bowl.bowlId}?customerId=${user.customerId}`
      );
      toast.success(`${bowl.bowlName} đã được thêm vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại");
    }
  };

  return (
    <div className="p-6 bg-[#F8F4E9] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            Bowl của tôi
          </h1>
          <p className="text-sm text-gray-500">Quản lý bowl</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center w-full sm:w-80 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 w-full outline-none bg-transparent text-sm"
              placeholder="Tìm tên bowl..."
            />
            <div className="px-3 text-gray-500">
              <Search size={18} />
            </div>
          </div>
          <button
            onClick={fetchBowls}
            className="ml-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"
            title="Làm mới"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-sm">Làm mới</span>
          </button>
          <div className="ml-2 flex items-center gap-2 border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 ${
                viewMode === "table" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 ${
                viewMode === "card" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="overflow-x-auto bg-white rounded-2xl shadow p-4"
          >
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
              <thead className="bg-gray-100 font-medium">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3 text-left">Tên Bowl</th>
                  <th className="py-2 px-3">Giá trị</th>
                  <th className="py-2 px-3">Ngày tạo</th>
                  <th className="py-2 px-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      Không có bowl nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b, i) => (
                    <tr
                      key={b.bowlId}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-3 text-center">{i + 1}</td>
                      <td className="py-2 px-3">{b.bowlName}</td>
                      <td className="py-2 px-3 text-right font-semibold">
                        {fmtCurrency(b.totalPrice)}₫
                      </td>
                      <td className="py-2 px-3">{safeDate(b.createdAt)}</td>
                      <td className="py-2 px-3 flex gap-2">
                        <button
                          onClick={() => handleAddToCart(b)}
                          className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                        >
                          Thêm vào giỏ
                        </button>
                        <button
                          onClick={() => setSelectedBowl(b)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBowl(b);
                            setTimeout(handlePrint, 200);
                          }}
                          className="px-2 py-1 bg-white border rounded-full text-sm"
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
          <motion.div
            key="card"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.length === 0 ? (
              <div className="col-span-full p-6 text-center bg-white rounded-2xl shadow text-gray-500">
                Không có bowl nào.
              </div>
            ) : (
              filtered.map((b, i) => (
                <motion.div
                  key={b.bowlId}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
                >
                  <div className="text-lg font-bold">{b.bowlName}</div>
                  <div className="text-gray-700 mt-1">
                    Giá trị:{" "}
                    <span className="font-semibold">
                      {fmtCurrency(b.totalPrice)}₫
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Ngày tạo: {safeDate(b.createdAt)}
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleAddToCart(b)}
                      className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => setSelectedBowl(b)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBowl(b);
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

      {/* Modal */}
      <BowlModal
        bowl={selectedBowl}
        onClose={() => setSelectedBowl(null)}
        printRef={printRef}
      />
    </div>
  );
};

export default BowlPage;

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
import { Search, X, Printer } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

/* ================= Helper ================= */

const fmtCurrency = (v) => Number(v).toLocaleString("vi-VN");

const safeDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString();
};

/* ================= Modal ================= */

const BowlModal = ({ bowl, onClose, printRef }) => {
  if (!bowl) return null;

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
            <h2 className="font-bold text-xl">
              Bowl: {bowl.bowlName}
            </h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <span className="font-semibold">Giá:</span>{" "}
                {fmtCurrency(bowl.totalPrice)}₫
              </div>

              <div>
                <span className="font-semibold">Ngày tạo:</span>{" "}
                {safeDate(bowl.createdAt)}
              </div>

              <div>
                <span className="font-semibold">Calories:</span>{" "}
                {bowl.baseCalories}
              </div>

              <div>
                <span className="font-semibold">Protein:</span>{" "}
                {bowl.totalProtein}g
              </div>

              <div>
                <span className="font-semibold">Carbs:</span>{" "}
                {bowl.totalCarbs}g
              </div>

              <div>
                <span className="font-semibold">Fat:</span>{" "}
                {bowl.totalFat}g
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-semibold mb-2">Nguyên liệu</h3>

              <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Giá</th>
                  </tr>
                </thead>

                <tbody>
                  {bowl.ingredients?.map((ing, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 text-center">{i + 1}</td>

                      <td className="p-2">
                        {ing.ingredientName}
                      </td>

                      <td className="p-2 text-center">
                        {ing.quantity}
                      </td>

                      <td className="p-2 text-right">
                        {fmtCurrency(ing.price)}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ================= Page ================= */

export default function Farvotite() {
  const { user } = useContext(AuthContext);

  const [bowls, setBowls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBowl, setSelectedBowl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const printRef = useRef(null);

  /* Fetch bowls */

  const fetchBowls = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/bowl/user/${user.customerId}`
      );

      setBowls(res.data || []);
    } catch {
      toast.error("Không thể tải bowl");
    } finally {
      setLoading(false);
    }
  }, [user.customerId]);

  useEffect(() => {
    fetchBowls();
  }, [fetchBowls]);

  /* Search */

  const filtered = useMemo(() => {
    if (!searchTerm) return bowls;

    return bowls.filter((b) =>
      b.bowlName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [bowls, searchTerm]);

  /* Print */

  const handlePrint = () => {
    if (!printRef.current) return;

    const w = window.open("", "_blank", "width=900,height=700");

    w.document.write(`
      <html>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    w.print();
    w.close();
  };

  /* Add to cart */

  const handleAddToCart = async (bowl) => {
    try {
      await axios.post(
        `http://localhost:5000/api/bowl/clone-to-cart/${bowl.bowlId}?customerId=${user.customerId}`
      );

      toast.success("Đã thêm bowl vào giỏ hàng");
    } catch {
      toast.error("Thêm vào giỏ thất bại");
    }
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bowl của tôi</h1>

        <p className="text-sm text-gray-500">
          Danh sách bowl bạn đã tạo
        </p>
      </div>

      {/* Filter */}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center bg-white border rounded-xl px-3 w-64">
          <Search size={16} className="text-gray-400" />

          <input
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Tên bowl"
            className="px-2 py-2 w-full outline-none text-sm"
          />
        </div>

        <button
          onClick={fetchBowls}
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
              <th className="p-4 text-center font-semibold text-gray-600">
                #
              </th>

              <th className="p-4 text-left font-semibold text-gray-600">
                Tên Bowl
              </th>

              <th className="p-4 text-right font-semibold text-gray-600">
                Giá
              </th>

              <th className="p-4 text-center font-semibold text-gray-600">
                Ngày tạo
              </th>

              <th className="p-4 text-center font-semibold text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400"
                >
                  Không có bowl
                </td>
              </tr>
            ) : (
              filtered.map((b, i) => (
                <tr
                  key={b.bowlId}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-center">
                    {i + 1}
                  </td>

                  <td className="p-4 font-medium text-gray-700">
                    {b.bowlName}
                  </td>

                  <td className="p-4 text-right font-semibold">
                    {fmtCurrency(b.totalPrice)}₫
                  </td>

                  <td className="p-4 text-center">
                    {safeDate(b.createdAt)}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleAddToCart(b)
                        }
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-medium transition"
                      >
                        Thêm giỏ
                      </button>

                      <button
                        onClick={() =>
                          setSelectedBowl(b)
                        }
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-medium transition"
                      >
                        Xem
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBowl(b);
                          setTimeout(
                            handlePrint,
                            200
                          );
                        }}
                        className="px-3 py-1.5 border rounded-full hover:bg-gray-100 transition"
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

      {/* Modal */}

      <BowlModal
        bowl={selectedBowl}
        onClose={() => setSelectedBowl(null)}
        printRef={printRef}
      />
    </div>
  );
}
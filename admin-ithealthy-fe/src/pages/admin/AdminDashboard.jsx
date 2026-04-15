import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { useAuthAdmin } from "../../hooks/useAuthAdmin";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, Store, Package, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import axios from "axios";

const AdminDashboard = () => {
  const { admin } = useAuthAdmin();
  const navigate = useNavigate();

  const [totalStaff, setTotalStaff] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeIngredients, setStoreIngredients] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [revenueData, setRevenueData] = useState([]);

  // Fetch tổng quan dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const [staffRes, storeRes, productRes] = await Promise.all([
          adminApi.getStaffs(),
          adminApi.getStores(),
          adminApi.getAllProducts(),
        ]);

        const staffs = staffRes.data || [];
        setTotalStaff(staffs.filter((s) => s.roleStaff?.toLowerCase() === "staff").length);

        const storesData = storeRes.data || [];
        setTotalStores(storesData.length);
        setStores(storesData);
        if (storesData.length > 0 && !selectedStoreId) setSelectedStoreId(storesData[0].storeId);

        const products = productRes.data || [];
        setTotalProducts(products.length);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu dashboard:", err);
        toast.error("Không thể tải dữ liệu dashboard!");
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, [selectedStoreId]);

  // Fetch tồn kho cửa hàng
  useEffect(() => {
    const fetchStoreInventory = async (storeId) => {
      if (!storeId) return;
      setLoadingInventory(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/storeinventory/store/${storeId}`);
        const data = res.data || [];
        const transformed = data.map((item) => {
          const quantity = item.stockQuantity || 0;
          const threshold = item.reorderLevel || 100;
          const percent = Math.min((quantity / threshold) * 100, 100);
          return {
            name: item.ingredientName || "Không tên",
            quantity,
            threshold,
            percent,
            unit: item.unit || "g",
          };
        });
        setStoreIngredients(transformed);
      } catch (err) {
        console.error("❌ Lỗi fetch tồn kho cửa hàng:", err);
        toast.error("Không thể tải dữ liệu tồn kho cửa hàng!");
        setStoreIngredients([]);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchStoreInventory(selectedStoreId);
  }, [selectedStoreId]);

  // Fetch doanh thu và tính top 5
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/revenue/report");
        const data = res.data || [];

        const revenueByStore = data.reduce((acc, item) => {
          if (!acc[item.storeId]) {
            acc[item.storeId] = {
              storeId: item.storeId,
              storeName: item.storeName,
              totalRevenue: 0,
            };
          }
          acc[item.storeId].totalRevenue += item.totalRevenue;
          return acc;
        }, {});

        let aggregatedData = Object.values(revenueByStore);
        aggregatedData.sort((a, b) => b.totalRevenue - a.totalRevenue);
        const top5Revenue = aggregatedData.slice(0, 5);

        setRevenueData(top5Revenue);
        const total = aggregatedData.reduce((sum, r) => sum + r.totalRevenue, 0);
        setTotalRevenue(total);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu doanh thu:", err);
        toast.error("Không thể tải dữ liệu doanh thu!");
      }
    };

    fetchRevenue();
  }, []);

  const cards = [
    {
      title: "Tổng nhân viên",
      value: totalStaff,
      color: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      icon: <Users className="h-12 w-12 text-white" />,
      link: "/admin/staffs",
    },
    {
      title: "Tổng cửa hàng",
      value: totalStores,
      color: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
      icon: <Store className="h-12 w-12 text-white" />,
      link: "/admin/stores",
    },
    {
      title: "Tổng sản phẩm",
      value: totalProducts,
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
      icon: <Package className="h-12 w-12 text-white" />,
      link: "/admin/products",
    },
    {
      title: "Tổng doanh thu",
      value: totalRevenue,
      color: "bg-purple-500",
      hover: "hover:bg-purple-600",
      icon: <TrendingUp className="h-12 w-12 text-white" />,
      link: "/admin/revenue",
    },
  ];

  // Custom label component for warning icon
  const WarningLabel = (props) => {
    const { x, y, width, payload } = props;
    // only show warning if quantity < threshold
    if (!payload || payload.quantity >= payload.threshold) return null;
    // place icon slightly above top of bar
    const centerX = x + width / 2;
    const iconY = y - 8;
    return (
      <text x={centerX} y={iconY} textAnchor="middle" fill="#DC2626" fontSize={16}>
        ⚠️
      </text>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8">
        👋 Chào mừng,{" "}
        <span className="text-indigo-600">{admin?.fullName || "Admin"}</span>
      </h2>

      {/* GRID CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.link)}
            className={`relative flex items-center justify-between rounded-2xl shadow-lg p-6 text-white cursor-pointer transform transition-all duration-300 ${card.color} ${card.hover} hover:scale-105`}
          >
            <div>
              <p className="text-lg opacity-90 font-medium">{card.title}</p>
              <h3 className="text-4xl font-bold mt-2">
                {loadingDashboard ? "..." : card.value.toLocaleString()}
              </h3>
              {card.title === "Tổng doanh thu" && (
                <p className="text-sm mt-1 opacity-80">Click để xem chi tiết</p>
              )}
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ doanh thu top 5 */}
      <div className="bg-white p-6 mt-12 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
       
        <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            📊 Doanh thu top 5 cửa hàng
          </h3>
        {loadingDashboard || revenueData.length === 0 ? (
          <p>Đang tải dữ liệu doanh thu...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={1} />      {/* Vàng kim thuần */}
    <stop offset="50%" stopColor="#FFEA70" stopOpacity={0.85} />  {/* Vàng sáng trung gian */}
    <stop offset="95%" stopColor="#FFF8DC" stopOpacity={0.6} />   {/* Vàng nhạt ánh kim */}
                </linearGradient>
              </defs>

              <XAxis
                dataKey="storeName"
                tick={{ fontSize: 14, fontWeight: "bold" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                }
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="totalRevenue"
                radius={[10, 10, 0, 0]}
                fill="url(#colorRevenue)"
                animationDuration={800}
                barSize={300}
              >
                <LabelList
                  dataKey="totalRevenue"
                  position="top"
                  formatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(value)
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tồn kho cửa hàng (cập nhật: hiển thị cảnh báo khi thiếu) */}
      {/* Tồn kho cửa hàng */}
      <div className="bg-white p-6 mt-12 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            📦 Tồn kho cửa hàng
          </h3>

          <select
            className="px-4 py-2 border rounded-xl shadow-sm bg-white text-gray-700 font-medium focus:ring-2 focus:ring-indigo-400"
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
          >
            {stores.length === 0 ? (
              <option>Không có cửa hàng</option>
            ) : (
              stores.map((store) => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Legend VIP */}
        <div className="flex items-center gap-6 mb-4 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-green-400"></span> Đầy (70%+)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-yellow-400"></span> Cảnh báo (30% - 70%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-red-400"></span> Gần hết (≤ 30%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm border-2 border-red-600"></span> Dưới ngưỡng cho phép
          </div>
        </div>

        {loadingInventory ? (
          <p>Đang tải dữ liệu tồn kho...</p>
        ) : storeIngredients.length === 0 ? (
          <p>Không có dữ liệu tồn kho</p>
        ) : (
          <ResponsiveContainer width="100%" height={330}>
            <BarChart
              data={storeIngredients}
              margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
              barCategoryGap="25%"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="colorStockGood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0.7} />
                </linearGradient>

                <linearGradient id="colorStockWarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity={0.7} />
                </linearGradient>

                <linearGradient id="colorStockLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#FCA5A5" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              {/* X-Axis */}
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                  fontWeight: "bold",
                  angle: -50,
                  textAnchor: "end",
                }}
                interval={0}
                height={80}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
              />

              {/* Y-Axis */}
              <YAxis />

              {/* Tooltip VIP PRO */}
              <Tooltip
                formatter={(value, name, props) => {
                  const percent = props.payload?.percent || 0;
                  const unit = props.payload?.unit || "";
                  const threshold = props.payload?.threshold || 0;

                  return [
                    `${value} ${unit} (${percent.toFixed(0)}%)`,
                    `Ngưỡng cảnh báo: ${threshold} ${unit}`,
                  ];
                }}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              />

              {/* Bars */}
              <Bar
                dataKey="quantity"
                radius={[12, 12, 0, 0]}
                animationDuration={700}
              >
                {storeIngredients.map((entry) => {
                  let fillColor = "url(#colorStockGood)";

                  if (entry.percent <= 30) fillColor = "url(#colorStockLow)";
                  else if (entry.percent <= 70) fillColor = "url(#colorStockWarn)";

                  const isLow = entry.quantity < entry.threshold;

                  return (
                    <Cell
                      key={entry.name}
                      fill={fillColor}
                      stroke={isLow ? "#DC2626" : "none"}
                      strokeWidth={isLow ? 3 : 0}
                      style={{
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.opacity = 0.8)}
                      onMouseOut={(e) => (e.target.style.opacity = 1)}
                    />
                  );
                })}
              </Bar>

              {/* ⚠ Label cảnh báo */}
              <LabelList
                dataKey="quantity"
                content={(props) => {
                  const { x, y, width, value, payload } = props;

                  if (payload.quantity < payload.threshold) {
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#DC2626"
                        textAnchor="middle"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        ⚠
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;

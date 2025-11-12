import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { useAuthAdmin } from "../../hooks/useAuthAdmin";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, Store, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";

const AdminDashboard = () => {
  useAuthAdmin();
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminInfo"));

  const [totalStaff, setTotalStaff] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeIngredients, setStoreIngredients] = useState([]);
  const [prevStoreIngredients, setPrevStoreIngredients] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Fetch tổng quan dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const staffRes = await adminApi.getStaffs();
        const staffs = staffRes.data || [];
        setTotalStaff(staffs.filter((s) => s.roleStaff?.toLowerCase() === "staff").length);

        const storeRes = await adminApi.getStores();
        const storesData = storeRes.data || [];
        setTotalStores(storesData.length);
        setStores(storesData);
        if (storesData.length > 0 && !selectedStoreId) setSelectedStoreId(storesData[0].storeId);

        const productRes = await adminApi.getAllProducts();
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
        const res = await axios.get(
          `http://localhost:5000/api/storeinventory/store/${storeId}`
        );
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
            unit: "g",
          };
        });

        // Lưu dữ liệu cũ trước khi cập nhật
        setPrevStoreIngredients(storeIngredients);
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
  ];

  // Màu bar theo % tồn kho
  const getBarColor = (percent) => {
    if (percent <= 30) return "#FF4D4F"; // đỏ
    if (percent <= 70) return "#FFC107"; // vàng
    return "#52C41A"; // xanh
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8">
        👋 Chào mừng,{" "}
        <span className="text-indigo-600">{admin?.fullName || "Admin"}</span>
      </h2>

      {/* GRID CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.link)}
            className={`relative flex items-center justify-between rounded-2xl shadow-lg p-6 text-white cursor-pointer transform transition-all duration-300 ${card.color} ${card.hover} hover:scale-105`}
          >
            <div>
              <p className="text-lg opacity-90 font-medium">{card.title}</p>
              <h3 className="text-4xl font-bold mt-2">
                {loadingDashboard ? "..." : card.value}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Dropdown chọn cửa hàng */}
      <div className="mt-12 mb-4">
        <label className="mr-2 font-medium">Chọn cửa hàng:</label>
        <select
          className="border px-3 py-1 rounded"
          value={selectedStoreId || ""}
          onChange={(e) => setSelectedStoreId(Number(e.target.value))}
        >
          {stores.map((store) => (
            <option key={store.storeId} value={store.storeId}>
              {store.storeName || `Cửa hàng ${store.storeId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Biểu đồ tồn kho */}
<div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
  <h3 className="text-2xl font-bold mb-4 text-gray-800">
    📊 Tồn kho cửa hàng
  </h3>
  {loadingInventory ? (
    <p>Đang tải dữ liệu tồn kho...</p>
  ) : storeIngredients.length === 0 ? (
    <p>Không có dữ liệu tồn kho</p>
  ) : (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={storeIngredients}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        barCategoryGap="20%"
      >
        {/* Gradient màu bar */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52C41A" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#52C41A" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis />
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
          formatter={(value, name, props) => {
            const prev = prevStoreIngredients.find(p => p.name === props.payload.name);
            return [
              `${value || 0} ${props.payload?.unit || ""} (trc: ${prev?.quantity || 0})`,
              name
            ];
          }}
        />

        <Bar
          dataKey="quantity"
          isAnimationActive={true}
          animationDuration={800}
          radius={[8, 8, 0, 0]} // bo tròn bar
        >
          {storeIngredients.map((entry) => (
            <Cell
              key={entry.name}
              fill="url(#barGradient)"
              stroke={entry.quantity < entry.threshold ? "#FF4D4F" : "none"}
              strokeWidth={entry.quantity < entry.threshold ? 2 : 0}
            />
          ))}
          <LabelList
            dataKey="quantity"
            position="top"
            formatter={(value, entry) => `${value || 0} ${entry?.unit || ""}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )}
</div>


      {/* FOOTER */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} IT Healthy Admin Dashboard
      </div>
    </div>
  );
};

export default AdminDashboard;

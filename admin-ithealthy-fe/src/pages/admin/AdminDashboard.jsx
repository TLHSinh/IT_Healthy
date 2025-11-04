import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { useAuthAdmin } from "../../hooks/useAuthAdmin";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, Store, Package } from "lucide-react"; // icon hiện đại

const AdminDashboard = () => {
  useAuthAdmin(); // kiểm tra token
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("adminInfo"));

  const [totalStaff, setTotalStaff] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tổng nhân viên
        const staffRes = await adminApi.getStaffs();
        const staffs = staffRes.data || [];
        const staffCount = staffs.filter(
          (s) => s.roleStaff?.toLowerCase() === "staff"
        ).length;
        setTotalStaff(staffCount);

        // Tổng cửa hàng
        const storeRes = await adminApi.getStores();
        const stores = storeRes.data || [];
        setTotalStores(stores.length);

        // Tổng sản phẩm
        const productRes = await adminApi.getAllProducts();
        const products = productRes.data || [];
        setTotalProducts(products.length);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu dashboard:", err);
        toast.error("Không thể tải dữ liệu dashboard!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cấu hình dữ liệu card
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
                {loading ? "..." : card.value}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} IT Healthy Admin Dashboard
      </div>
    </div>
  );
};

export default AdminDashboard;

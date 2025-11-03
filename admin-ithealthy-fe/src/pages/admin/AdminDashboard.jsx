import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { useAuthAdmin } from "../../hooks/useAuthAdmin";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  useAuthAdmin(); // kiểm tra token
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("adminInfo"));

  const [totalStaff, setTotalStaff] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const staffRes = await adminApi.getStaffs();
        const staffs = staffRes.data || [];
        const staffCount = staffs.filter(
          (s) => s.roleStaff?.toLowerCase() === "staff"
        ).length;
        setTotalStaff(staffCount);

        const storeRes = await adminApi.getStores();
        const stores = storeRes.data || [];
        setTotalStores(stores.length);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu dashboard:", err);
        toast.error("Không thể tải dữ liệu dashboard!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Chào mừng, {admin?.fullName}
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Tổng nhân viên */}
        <div
          onClick={() => navigate("/admin/staffs")}
          className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-indigo-50 transition"
        >
          <p className="text-gray-600">Tổng nhân viên</p>
          <h3 className="text-3xl font-bold text-indigo-600">
            {loading ? "..." : totalStaff}
          </h3>
        </div>

        {/* Tổng cửa hàng */}
        <div
          onClick={() => navigate("/admin/stores")}
          className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-indigo-50 transition"
        >
          <p className="text-gray-600">Tổng cửa hàng</p>
          <h3 className="text-3xl font-bold text-indigo-600">
            {loading ? "..." : totalStores}
          </h3>
        </div>

        
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import { Activity, Flame, TrendingUp } from "lucide-react";

export default function HealthMonitoringPage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:5000/api/HealthRecords/user/${user.customerId}`)
      .then((res) => {
        const formatted = res.data.map((item) => ({
          ...item,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));

        setData(formatted.reverse());
      })
      .catch(() => alert("Không tải được dữ liệu!"));
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-xl font-semibold text-gray-700">
          Vui lòng đăng nhập để xem dữ liệu sức khỏe!
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br  to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            📊 Health Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Theo dõi chỉ số sức khỏe của bạn theo thời gian
          </p>
          
        </div>
        

        {/* ===== STATS CARDS ===== */}
        {latest && ( 
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg flex items-center gap-4">
              <Activity className="text-blue-500" size={32} />
              <div>
                <p className="text-gray-500 text-sm">BMI</p>
                <p className="text-xl font-bold">{latest.bmi}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg flex items-center gap-4">
              <Flame className="text-orange-500" size={32} />
              <div>
                <p className="text-gray-500 text-sm">BMR</p>
                <p className="text-xl font-bold">{latest.bmr}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg flex items-center gap-4">
              <TrendingUp className="text-green-500" size={32} />
              <div>
                <p className="text-gray-500 text-sm">TDEE</p>
                <p className="text-xl font-bold">{latest.tdee} kcal</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== BMI CHART ===== */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">
            BMI theo thời gian
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bmi"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ===== TDEE CHART ===== */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">
            TDEE theo thời gian
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="tdee"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ===== HISTORY ===== */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">
            Lịch sử theo dõi
          </h2>

          {data.length === 0 ? (
            <p className="text-gray-400">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.healthRecordId}
                  className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 transition border"
                >
                  <div>
                    <p className="font-semibold text-gray-700">
                      {item.date}
                    </p>
                    <p className="text-sm text-gray-500">
                      BMI: {item.bmi} • BMR: {item.bmr}
                    </p>
                  </div>

                  <div className="text-green-500 font-bold text-lg">
                    {item.tdee} kcal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
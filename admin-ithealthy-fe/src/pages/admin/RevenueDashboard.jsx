import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, DatePicker, Checkbox, Button, Table, Spin, Card } from "antd";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Store, CalendarDays } from "lucide-react";

const { RangePicker } = DatePicker;

const RevenueDashboard = () => {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [rangeDate, setRangeDate] = useState([null, null]);
  const [byDay, setByDay] = useState(false);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stores");
      setStores(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (storeId) params.storeId = storeId;
      if (rangeDate[0]) params.fromDate = dayjs(rangeDate[0]).format("YYYY-MM-DD");
      if (rangeDate[1]) params.toDate = dayjs(rangeDate[1]).format("YYYY-MM-DD");
      if (byDay) params.byDay = true;

      const res = await axios.get("http://localhost:5000/api/revenue/report", { params });
      setReport(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const totalRevenue = report.reduce((sum, r) => sum + r.totalRevenue, 0);

  return (
    <div>
      <motion.h1
        className="text-3xl font-extrabold text-indigo-700 mb-6 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        📊 BÁO CÁO DOANH THU HỆ THỐNG
      </motion.h1>

      {/* Bộ lọc */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-6 flex flex-wrap gap-6 items-center justify-center border border-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Store className="text-indigo-500" size={20} />
          <Select
            placeholder="Chọn cửa hàng"
            style={{ width: 220 }}
            allowClear
            value={storeId}
            onChange={setStoreId}
            options={stores.map((s) => ({ label: s.storeName, value: s.storeId }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="text-indigo-500" size={20} />
          <RangePicker
            value={rangeDate}
            onChange={(dates) => setRangeDate(dates)}
            className="rounded-lg"
          />
        </div>

        <Checkbox checked={byDay} onChange={(e) => setByDay(e.target.checked)}>
          Thống kê theo ngày
        </Checkbox>

        <Button type="primary" onClick={fetchReport}>
          Xem báo cáo
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {report.length > 0 && (
            <>
              {/* Tổng quan */}
              <motion.div
                className="grid md:grid-cols-3 gap-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="rounded-2xl border border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Tổng doanh thu</p>
                      <h2 className="text-2xl font-bold text-indigo-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(totalRevenue)}
                      </h2>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <TrendingUp className="text-indigo-600" />
                    </div>
                  </div>
                </Card>
                <Card className="rounded-2xl border border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 p-4">
                  <p className="text-gray-500 mb-2">Số cửa hàng thống kê</p>
                  <h2 className="text-2xl font-bold text-indigo-600">
                    {new Set(report.map((r) => r.storeId)).size}
                  </h2>
                </Card>
                <Card className="rounded-2xl border border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 p-4">
                  <p className="text-gray-500 mb-2">Tổng kỳ báo cáo</p>
                  <h2 className="text-2xl font-bold text-indigo-600">{report.length}</h2>
                </Card>
              </motion.div>

              {/* Biểu đồ */}
              <motion.div
                className="bg-white p-6 mt-8 rounded-2xl shadow-lg border border-indigo-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-lg font-semibold text-indigo-700 mb-4">Biểu đồ doanh thu</h2>
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={report} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis
                        dataKey={byDay ? "day" : "month"}
                        tickFormatter={(v) => (byDay ? `Ngày ${v}` : `Tháng ${v}`)}
                        tick={{ fontSize: 12, fill: "#4B5563" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#4B5563" }} />
                      <Tooltip
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(value)
                        }
                      />
                      <Bar dataKey="totalRevenue" fill="#6366f1" radius={[8, 8, 0, 0]}>
                        <LabelList
                          dataKey="totalRevenue"
                          formatter={(value) =>
                            new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(value)
                          }
                          position="top"
                          className="text-xs text-indigo-700"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bảng dữ liệu chi tiết */}
              <motion.div
                className="bg-white p-6 mt-8 rounded-2xl shadow-lg border border-indigo-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-lg font-semibold text-indigo-700 mb-4">Chi tiết doanh thu</h2>
                <Table
                  rowKey={(r) => `${r.storeId}-${r.year}-${r.month}-${r.day}`}
                  dataSource={report}
                  pagination={{ pageSize: 8, showSizeChanger: true }}
                  bordered
                  columns={[
                    { title: "Cửa hàng", dataIndex: "storeName", key: "storeName" },
                    { title: "Năm", dataIndex: "year", key: "year", align: "center" },
                    { title: "Tháng", dataIndex: "month", key: "month", align: "center" },
                    byDay && {
                      title: "Ngày",
                      dataIndex: "day",
                      key: "day",
                      align: "center",
                    },
                    {
                      title: "Doanh thu",
                      dataIndex: "totalRevenue",
                      key: "totalRevenue",
                      align: "right",
                      render: (value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value),
                    },
                  ].filter(Boolean)}
                  scroll={{ x: "max-content" }}
                />
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RevenueDashboard;

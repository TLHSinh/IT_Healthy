import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Space, Image, Tooltip, Input, Card, Spin } from "antd";
import { PlusCircle, RefreshCcw, LayoutGrid, List, Edit2 } from "lucide-react";
import IngredientModal from "../../components/admin/IngredientModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/ingredient");
      setIngredients(res.data);
    } catch (err) {
      toast.error("Lấy danh sách nguyên liệu thất bại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleOpenModal = (ingredient = null) => {
    setSelectedIngredient(ingredient);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
    setModalVisible(false);
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.ingredientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { title: "ID", dataIndex: "ingredientId", key: "ingredientId", width: 80 },
    { title: "Tên Nguyên Liệu", dataIndex: "ingredientName", key: "ingredientName" },
    { title: "Đơn vị", dataIndex: "unit", key: "unit", width: 100 },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (val) => `${val.toLocaleString()} đ`,
    },
    { title: "Calories", dataIndex: "calories", key: "calories" },
    { title: "Protein", dataIndex: "protein", key: "protein" },
    { title: "Carbs", dataIndex: "carbs", key: "carbs" },
    { title: "Fat", dataIndex: "fat", key: "fat" },
    {
      title: "Hình ảnh",
      dataIndex: "imageIngredients",
      key: "imageIngredients",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 8 }}
            preview={{ mask: <span>Xem ảnh</span> }}
          />
        ) : (
          "Chưa có"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-white text-xs ${
            val ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {val ? "Còn hàng" : "Hết hàng"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa / Xóa">
            <Button
              type="primary"
              icon={<Edit2 size={16} />}
              onClick={() => handleOpenModal(record)}
            >
              Sửa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
            🧂 Quản lý nguyên liệu
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý danh sách nguyên liệu, thông tin dinh dưỡng và hình ảnh nguyên liệu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <Input.Search
            placeholder="Tìm kiếm nguyên liệu..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-60"
          />
          <Button
            icon={<RefreshCcw size={16} />}
            onClick={fetchIngredients}
            className="border-gray-300"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusCircle size={18} />}
            onClick={() => handleOpenModal()}
          >
            Thêm nguyên liệu
          </Button>
          <div className="flex gap-1">
            <Tooltip title="Xem danh sách">
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<List size={16} />}
                onClick={() => setViewMode("table")}
              />
            </Tooltip>
            <Tooltip title="Xem dạng thẻ">
              <Button
                type={viewMode === "card" ? "primary" : "default"}
                icon={<LayoutGrid size={16} />}
                onClick={() => setViewMode("card")}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Hiển thị danh sách */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : viewMode === "table" ? (
        <Table
          dataSource={filteredIngredients}
          columns={columns}
          rowKey="ingredientId"
          pagination={{ pageSize: 8 }}
          bordered
          className="bg-white rounded-lg shadow"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredIngredients.map((item) => (
            <Card
              key={item.ingredientId}
              hoverable
              className="shadow-md border rounded-xl overflow-hidden"
              cover={
                <Image
                  src={item.imageIngredients || "/no-image.png"}
                  height={180}
                  style={{ objectFit: "cover" }}
                  preview={{ mask: <span>Xem ảnh</span> }}
                />
              }
            >
              <h3 className="font-semibold text-gray-800">{item.ingredientName}</h3>
              <p className="text-sm text-gray-500">Đơn vị: {item.unit}</p>
              <p className="text-sm text-gray-500">
                Giá: {item.basePrice?.toLocaleString()} đ
              </p>
              <p className="text-sm text-gray-500">
                {item.isAvailable ? (
                  <span className="text-green-600 font-medium">Còn hàng</span>
                ) : (
                  <span className="text-red-500 font-medium">Hết hàng</span>
                )}
              </p>
              <div className="mt-3 flex justify-end">
                <Button
                  type="primary"
                  icon={<Edit2 size={16} />}
                  onClick={() => handleOpenModal(item)}
                >
                  Sửa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      <IngredientModal
        visible={modalVisible}
        onClose={handleCloseModal}
        ingredient={selectedIngredient}
        onSaved={fetchIngredients}
      />
    </div>
  );
};

export default IngredientManagement;

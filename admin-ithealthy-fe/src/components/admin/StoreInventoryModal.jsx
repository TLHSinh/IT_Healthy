// src/components/admin/StoreInventoryModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Input, Form, Select, Tooltip, Spin } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

// Editable cell cho table
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  ...restProps
}) => (
  <td {...restProps}>
    {editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[{ required: true, message: `Vui lòng nhập ${title}` }]}
      >
        <Input type={inputType} className="border rounded-md px-2 py-1" />
      </Form.Item>
    ) : (
      children
    )}
  </td>
);

const StoreInventoryModal = ({ isOpen, setIsOpen, storeId, storeName }) => {
  const [inventory, setInventory] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [newItem, setNewItem] = useState({
    IngredientId: null,
    StockQuantity: "",
    ReorderLevel: "",
  });
  const [searchText, setSearchText] = useState("");
  const [filterValue, setFilterValue] = useState(null);
  const [modalProcessing, setModalProcessing] = useState(false); // overlay + spinner cho tất cả thao tác

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/storeinventory/store/${storeId}`
      );
      setInventory(res.data || []);
    } catch {
      toast.error("Không tải được tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/ingredient/all-ingredients"
      );
      setIngredients(res.data || []);
    } catch {
      toast.error("Không tải được danh sách nguyên liệu");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
      fetchIngredients();
    }
  }, [isOpen]);

  const isEditing = (record) => record.storeIngredientId === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      IngredientId: record.ingredientId,
      StockQuantity: record.stockQuantity,
      ReorderLevel: record.reorderLevel,
    });
    setEditingKey(record.storeIngredientId);
  };

  const cancel = () => setEditingKey("");

  // Save (Cập nhật)
  const save = async (key) => {
    try {
      const values = await form.validateFields();
      const record = inventory.find((item) => item.storeIngredientId === key);

      const payload = {
        StoreId: storeId,
        IngredientId: values.IngredientId || record.ingredientId,
        StockQuantity: parseFloat(values.StockQuantity),
        ReorderLevel: parseFloat(values.ReorderLevel),
      };

      setModalProcessing(true);
      const res = await axios.put(
        `http://localhost:5000/api/storeinventory/${key}`,
        payload
      );
      setInventory((prev) =>
        prev.map((item) =>
          item.storeIngredientId === key ? { ...item, ...res.data.data } : item
        )
      );
      toast.success("Cập nhật thành công!");
      setEditingKey("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật!");
    } finally {
      setModalProcessing(false);
    }
  };

  // Thêm mới
  const handleAdd = async () => {
    if (!newItem.IngredientId) return toast.error("Vui lòng chọn nguyên liệu!");
    if (!newItem.StockQuantity) return toast.error("Vui lòng nhập số lượng!");

    const payload = {
      StoreId: storeId,
      IngredientId: newItem.IngredientId,
      StockQuantity: parseFloat(newItem.StockQuantity),
      ReorderLevel: parseFloat(newItem.ReorderLevel || 0),
    };

    try {
      setModalProcessing(true);
      const res = await axios.post(
        "http://localhost:5000/api/storeinventory",
        payload
      );
      setInventory((prev) => [...prev, { ...res.data.data }]);
      setNewItem({ IngredientId: null, StockQuantity: "", ReorderLevel: "" });
      toast.success("Thêm mới thành công!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi thêm!");
    } finally {
      setModalProcessing(false);
    }
  };

  // Xóa
  const handleDelete = async (id) => {
    try {
      setModalProcessing(true);
      await axios.delete(`http://localhost:5000/api/storeinventory/${id}`);
      setInventory((prev) =>
        prev.filter((item) => item.storeIngredientId !== id)
      );
      toast.success("Xóa thành công!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa!");
    } finally {
      setModalProcessing(false);
    }
  };

  const handleRefresh = () => {
    fetchInventory();
    toast.success("Đã làm mới dữ liệu");
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.ingredientName.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterValue ? item.reorderLevel >= filterValue : true)
  );

  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: "ingredientName",
      key: "ingredientName",
      render: (text) => (
        <Tooltip title={text}>
          <span className="font-medium">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      editable: true,
      align: "center",
    },
    {
      title: "Ngưỡng cảnh báo",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
      editable: true,
      align: "center",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      align: "center",
      render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "-"),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex justify-center gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="small"
              className="bg-green-500 hover:bg-green-600 transition-all"
              onClick={() => save(record.storeIngredientId)}
            >
              Lưu
            </Button>
            <Button
              icon={<CloseOutlined />}
              size="small"
              className="bg-gray-300 hover:bg-gray-400 transition-all"
              onClick={cancel}
            >
              Hủy
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Button
              icon={<EditOutlined />}
              size="small"
              className="bg-blue-500 hover:bg-blue-600 text-white transition-all"
              onClick={() => edit(record)}
            >
              Sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="transition-all"
              onClick={() => handleDelete(record.storeIngredientId)}
            >
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record) => ({
            record,
            inputType: "number",
            dataIndex:
              col.dataIndex === "stockQuantity"
                ? "StockQuantity"
                : "ReorderLevel",
            title: col.title,
            editing: isEditing(record),
          }),
        }
      : col
  );

  const existingIngredientIds = inventory.map((i) => i.ingredientId);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Modal
        title={
          <span className="text-2xl font-bold">
            📦 Quản lý tồn kho: {storeName}
          </span>
        }
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={1000}
        maskClosable={false}
        className="rounded-xl"
        bodyStyle={{
          maxHeight: "600px",
          overflowY: "auto",
          padding: "1.5rem",
          position: "relative",
        }}
      >
        {/* Overlay loading cho tất cả thao tác */}
        {modalProcessing && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-xl">
            <Spin size="large" />
          </div>
        )}

        {/* Form thêm nguyên liệu */}
        <div className="p-4 mb-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 transition-all duration-200">
          <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
            ➕ Thêm nguyên liệu
          </h3>
          <Form layout="inline" className="flex flex-wrap gap-4">
            <Form.Item label="Nguyên liệu">
              <Select
                showSearch
                placeholder="Chọn nguyên liệu"
                style={{ width: 240 }}
                value={newItem.IngredientId}
                onChange={(v) => setNewItem({ ...newItem, IngredientId: v })}
                optionFilterProp="children"
              >
                {ingredients.map((ing) => (
                  <Option
                    key={ing.ingredientId}
                    value={ing.ingredientId}
                    disabled={existingIngredientIds.includes(ing.ingredientId)}
                  >
                    {`${ing.ingredientId} - ${ing.ingredientName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Số lượng">
              <Input
                type="number"
                value={newItem.StockQuantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, StockQuantity: e.target.value })
                }
                style={{ width: 100 }}
              />
            </Form.Item>
            <Form.Item label="Ngưỡng">
              <Input
                type="number"
                value={newItem.ReorderLevel}
                onChange={(e) =>
                  setNewItem({ ...newItem, ReorderLevel: e.target.value })
                }
                style={{ width: 100 }}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-green-500 hover:bg-green-600 transition-all"
              onClick={handleAdd}
            >
              Thêm
            </Button>
          </Form>
        </div>

        {/* Search + Refresh + Filter */}
        <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl gap-3 transition-all duration-200">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm nguyên liệu..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Button
            icon={<ReloadOutlined />}
            className="bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0 transition-all"
            onClick={handleRefresh}
          >
            Làm mới
          </Button>
          <Select
            placeholder="Lọc theo ngưỡng"
            allowClear
            value={filterValue}
            onChange={(v) => setFilterValue(v)}
            className="w-40 flex-shrink-0"
          >
            <Option value={5}>≥ 5</Option>
            <Option value={10}>≥ 10</Option>
            <Option value={20}>≥ 20</Option>
          </Select>
        </div>

        {/* Table */}
        <Form form={form} component={false}>
          <Table
            dataSource={filteredInventory}
            columns={mergedColumns}
            rowKey="storeIngredientId"
            loading={loading}
            bordered
            components={{ body: { cell: EditableCell } }}
            className="shadow-lg rounded-xl transition-all duration-200"
            pagination={{
              position: ["bottomCenter"],
              pageSize: 8,
            }}
          />
        </Form>
      </Modal>
    </>
  );
};

export default StoreInventoryModal;

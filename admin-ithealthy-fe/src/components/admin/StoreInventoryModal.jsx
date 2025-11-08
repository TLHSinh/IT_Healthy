// src/components/admin/StoreInventoryModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Input, Form, Select, Tooltip } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Option } = Select;

// Editable cell
const EditableCell = ({ editing, dataIndex, title, inputType, record, children, ...restProps }) => (
  <td {...restProps}>
    {editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[{ required: true, message: `Vui lòng nhập ${title}` }]}
      >
        <Input type={inputType} />
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

  // Fetch tồn kho
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/storeinventory/store/${storeId}`);
      setInventory(res.data || []);
    } catch {
      toast.error("Không tải được tồn kho");
    } finally {
      setLoading(false);
    }
  };

  // Fetch nguyên liệu
  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ingredient");
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

  // Sửa
  const save = async (key) => {
    try {
      const values = await form.validateFields();
      const payload = {
        StoreId: storeId,
        IngredientId: values.IngredientId,
        StockQuantity: parseFloat(values.StockQuantity),
        ReorderLevel: parseFloat(values.ReorderLevel),
      };

      const res = await axios.put(`http://localhost:5000/api/storeinventory/${key}`, payload);
      toast.success("Cập nhật thành công!");
      setInventory((prev) =>
        prev.map((item) =>
          item.storeIngredientId === key
            ? { ...res.data, ingredientName: item.ingredientName, storeName }
            : item
        )
      );
      setEditingKey("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật!");
    }
  };

  // Thêm
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
      const res = await axios.post("http://localhost:5000/api/storeinventory", payload);
      toast.success("Thêm mới thành công!");
      setInventory((prev) => [...prev, { ...res.data.data }]);
      setNewItem({ IngredientId: null, StockQuantity: "", ReorderLevel: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi thêm!");
    }
  };

  // Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/storeinventory/${id}`);
      toast.success("Xóa thành công!");
      setInventory((prev) => prev.filter((item) => item.storeIngredientId !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa!");
    }
  };

  // Table
  const columns = [
    { title: "Nguyên liệu", dataIndex: "ingredientName", key: "ingredientName", render: (text) => <Tooltip title={text}>{text}</Tooltip> },
    { title: "Số lượng", dataIndex: "stockQuantity", key: "stockQuantity", editable: true, align: "center" },
    { title: "Ngưỡng cảnh báo", dataIndex: "reorderLevel", key: "reorderLevel", editable: true, align: "center" },
    { title: "Ngày cập nhật", dataIndex: "lastUpdated", key: "lastUpdated", align: "center", render: (text) => text ? new Date(text).toLocaleString("vi-VN") : "-" },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex justify-center gap-2">
            <Button type="primary" icon={<SaveOutlined />} size="small" onClick={() => save(record.storeIngredientId)}>Lưu</Button>
            <Button icon={<CloseOutlined />} size="small" onClick={cancel}>Hủy</Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Button icon={<EditOutlined />} size="small" onClick={() => edit(record)}>Sửa</Button>
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.storeIngredientId)}>Xóa</Button>
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
            dataIndex: col.dataIndex === "stockQuantity" ? "StockQuantity" : "ReorderLevel",
            title: col.title,
            editing: isEditing(record),
          }),
        }
      : col
  );

  // IDs nguyên liệu đã tồn tại
  const existingIngredientIds = inventory.map((i) => i.ingredientId);

  return (
    <Modal
      title={`📦 Quản lý tồn kho: ${storeName}`}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      width={950}
      maskClosable={false}
    >
      {/* Form thêm */}
      <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-indigo-700 mb-3">➕ Thêm nguyên liệu</h3>
        <Form layout="inline" className="flex flex-wrap gap-3">
          <Form.Item label="Nguyên liệu">
            <Select
              showSearch
              placeholder="Chọn nguyên liệu"
              style={{ width: 250 }}
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
            <Input type="number" value={newItem.StockQuantity} onChange={(e) => setNewItem({ ...newItem, StockQuantity: e.target.value })} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item label="Ngưỡng">
            <Input type="number" value={newItem.ReorderLevel} onChange={(e) => setNewItem({ ...newItem, ReorderLevel: e.target.value })} style={{ width: 100 }} />
          </Form.Item>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm</Button>
        </Form>
      </div>

      {/* Table */}
      <Form form={form} component={false}>
        <Table
          dataSource={inventory}
          columns={mergedColumns}
          rowKey="storeIngredientId"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
          components={{ body: { cell: EditableCell } }}
        />
      </Form>
    </Modal>
  );
};

export default StoreInventoryModal;

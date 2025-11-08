// src/components/admin/StoreProductsModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Input, Form, InputNumber, Select, Tooltip, Spin } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

// Editable Cell
const EditableCell = ({ editing, dataIndex, title, inputType, record, children, ...restProps }) => (
  <td {...restProps}>
    {editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[{ required: true, message: `Vui lòng nhập ${title}` }]}
      >
        {inputType === "number" ? (
          <InputNumber placeholder={`Nhập ${title}`} style={{ width: "100%" }} min={0} />
        ) : (
          <Input placeholder={`Nhập ${title}`} />
        )}
      </Form.Item>
    ) : (
      children
    )}
  </td>
);

const StoreProductsModal = ({ isOpen, setIsOpen, storeId, storeName }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [newProduct, setNewProduct] = useState({ productId: null, price: 0, stock: 0 });
  const [searchText, setSearchText] = useState("");
  const [modalProcessing, setModalProcessing] = useState(false);
  const [form] = Form.useForm();

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/storeproducts/store/${storeId}`);
      setProducts(res.data.data || []);
    } catch {
      toast.error("Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/all-products`);
      setAllProducts(res.data || []);
    } catch {
      toast.error("Không tải được danh sách sản phẩm");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchAllProducts();
    }
  }, [isOpen]);

  const isEditing = (record) => record.storeProductId === editingKey;
  const edit = (record) => {
    form.setFieldsValue({ price: record.price, stock: record.stock });
    setEditingKey(record.storeProductId);
  };
  const cancel = () => setEditingKey("");

  // Save edited product
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      setModalProcessing(true);
      await axios.put(`http://localhost:5000/api/storeproducts/${key}`, {
        StoreId: storeId,
        ProductId: row.productId || key,
        Price: row.price,
        Stock: row.stock,
        IsAvailable: true,
      });
      toast.success("Cập nhật thành công!");
      setEditingKey("");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setModalProcessing(false);
    }
  };

  // Add new product
  const handleAdd = async () => {
    if (!newProduct.productId) return toast.error("Vui lòng chọn sản phẩm");
    try {
      setModalProcessing(true);
      await axios.post(`http://localhost:5000/api/storeproducts`, {
        StoreId: storeId,
        ProductId: newProduct.productId,
        Price: newProduct.price,
        Stock: newProduct.stock,
        IsAvailable: true,
      });
      toast.success("Thêm sản phẩm thành công!");
      setNewProduct({ productId: null, price: 0, stock: 0 });
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setModalProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setModalProcessing(true);
      await axios.delete(`http://localhost:5000/api/storeproducts/${id}`);
      toast.success("Xóa thành công!");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setModalProcessing(false);
    }
  };

  const handleRefresh = () => fetchProducts();

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.productId?.toString().includes(searchText) ||
      p.descriptionProduct?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "ID", dataIndex: "productId", key: "productId", width: 80 },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName", ellipsis: true, render: (text) => <Tooltip title={text}>{text}</Tooltip> },
    { title: "Mô tả", dataIndex: "descriptionProduct", key: "descriptionProduct", ellipsis: true, render: (text) => <Tooltip title={text}>{text}</Tooltip> },
    { title: "Giá", dataIndex: "price", key: "price", editable: true, inputType: "number", align: "center", width: 120 },
    { title: "Số lượng", dataIndex: "stock", key: "stock", editable: true, inputType: "number", align: "center", width: 120 },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex justify-center gap-2">
            <Button type="primary" icon={<SaveOutlined />} size="small" className="bg-green-500 hover:bg-green-600" onClick={() => save(record.storeProductId)}>Lưu</Button>
            <Button icon={<CloseOutlined />} size="small" className="bg-gray-300 hover:bg-gray-400" onClick={cancel}>Hủy</Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Button icon={<EditOutlined />} size="small" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => edit(record)}>Sửa</Button>
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.storeProductId)}>Xóa</Button>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) =>
    col.editable
      ? { ...col, onCell: (record) => ({ record, inputType: col.inputType, dataIndex: col.dataIndex, title: col.title, editing: isEditing(record) }) }
      : col
  );

  const existingProductIds = products.map(p => p.productId);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Modal
        title={<span className="text-2xl font-bold">📦 Quản lý sản phẩm: {storeName}</span>}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={1000}
        maskClosable={false}
        className="rounded-xl"
        bodyStyle={{ maxHeight: '600px', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}
      >
        {/* Overlay spinner */}
        {modalProcessing && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-xl">
            <Spin size="large" />
          </div>
        )}

        {/* Form thêm sản phẩm */}
        <div className="p-4 mb-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
          <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">➕ Thêm sản phẩm</h3>
          <Form layout="inline" className="flex flex-wrap gap-4">
            <Form.Item label="Sản phẩm">
              <Select
                showSearch
                placeholder="Chọn sản phẩm"
                style={{ width: 240 }}
                value={newProduct.productId}
                onChange={v => setNewProduct({ ...newProduct, productId: v })}
                optionFilterProp="children"
              >
                {allProducts.map(p => (
                  <Option key={p.productId} value={p.productId} disabled={existingProductIds.includes(p.productId)}>
                    {p.productName} - {p.descriptionProduct}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Giá">
              <InputNumber
                style={{ width: 100 }}
                min={0}
                value={newProduct.price}
                onChange={v => setNewProduct({ ...newProduct, price: v })}
              />
            </Form.Item>
            <Form.Item label="Số lượng">
              <InputNumber
                style={{ width: 100 }}
                min={0}
                value={newProduct.stock}
                onChange={v => setNewProduct({ ...newProduct, stock: v })}
              />
            </Form.Item>
            <Button type="primary" icon={<PlusOutlined />} className="bg-green-500 hover:bg-green-600" onClick={handleAdd}>Thêm</Button>
          </Form>
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl gap-3">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm sản phẩm..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Button icon={<ReloadOutlined />} className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleRefresh}>Làm mới</Button>
        </div>

        {/* Table */}
        <Form form={form} component={false}>
          <Table
            dataSource={filteredProducts}
            columns={mergedColumns}
            rowKey="storeProductId"
            loading={loading}
            bordered
            components={{ body: { cell: EditableCell } }}
            className="shadow-lg rounded-xl"
            pagination={{ pageSize: 8, position: ['bottomCenter'] }}
          />
        </Form>
      </Modal>
    </>
  );
};

export default StoreProductsModal;

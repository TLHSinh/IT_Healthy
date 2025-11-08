import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Input, Form, InputNumber, Select, Tooltip, Space, Typography } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

// Editable Cell cho Table
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


// Form nhập sản phẩm mới
const AddProductForm = ({
  newProduct,
  setNewProduct,
  allProducts,
  onAdd,
  onRefresh,
  searchText,
  setSearchText,
}) => (
  <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
    <h3 className="text-lg font-semibold text-indigo-700 mb-3">➕ Thêm sản phẩm</h3>
    <Space wrap className="mb-3">
      {/* Select sản phẩm */}
      <Select
        placeholder="Chọn sản phẩm"
        value={newProduct.productId}
        onChange={(value) => setNewProduct({ ...newProduct, productId: value })}
        showSearch
        optionFilterProp="children"
        style={{ width: 300 }} // width cố định
        dropdownMatchSelectWidth={false} // dropdown không giãn theo Select
      >
        {allProducts.map((p) => (
          <Option key={p.productId} value={p.productId}>
            <div
              className="truncate"
              style={{ maxWidth: 250 }}
              title={`${p.productName} - ${p.descriptionProduct}`} // tooltip hover
            >
              {p.productName} - {p.descriptionProduct}
            </div>
          </Option>
        ))}
      </Select>

      {/* Giá */}
      <InputNumber
        placeholder="Giá"
        value={newProduct.price}
        onChange={(value) => setNewProduct({ ...newProduct, price: value })}
        style={{ width: 100 }}
        min={0}
      />

      {/* Số lượng */}
      <InputNumber
        placeholder="Số lượng"
        value={newProduct.stock}
        onChange={(value) => setNewProduct({ ...newProduct, stock: value })}
        style={{ width: 100 }}
        min={0}
      />

      {/* Nút thêm */}
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        Thêm
      </Button>

      {/* Tìm kiếm */}
      <Input
        placeholder="Tìm kiếm theo ID, tên hoặc mô tả"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ minWidth: 180 }}
        allowClear
      />

      {/* Nút làm mới */}
      <Button onClick={onRefresh}>Làm mới</Button>
    </Space>
  </div>
);


// Modal quản lý sản phẩm cửa hàng
const StoreProductsModal = ({ isOpen, setIsOpen, storeId, storeName }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [newProduct, setNewProduct] = useState({ productId: null, price: 0, stock: 0 });
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

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

  const save = async (key) => {
    try {
      const row = await form.validateFields();
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
    }
  };

  const handleAdd = async () => {
    if (!newProduct.productId) return toast.error("Vui lòng chọn sản phẩm");
    try {
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
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/storeproducts/${id}`);
      toast.success("Xóa thành công!");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleRefresh = () => fetchProducts();

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.productId?.toString().includes(searchText) ||
      p.descriptionProduct?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "ID", dataIndex: "productId", key: "productId", width: 80 },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
      render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
    },
    {
      title: "Mô tả",
      dataIndex: "descriptionProduct",
      key: "descriptionProduct",
      ellipsis: true,
      render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
    },
    { title: "Giá", dataIndex: "price", key: "price", editable: true, inputType: "number", width: 120, align: "center" },
    { title: "Số lượng", dataIndex: "stock", key: "stock", editable: true, inputType: "number", width: 120, align: "center" },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="small">
            <Button type="primary" icon={<SaveOutlined />} size="small" onClick={() => save(record.storeProductId)}>Lưu</Button>
            <Button icon={<CloseOutlined />} size="small" onClick={cancel}>Hủy</Button>
          </Space>
        ) : (
          <Space size="small">
            <Button type="default" icon={<EditOutlined />} size="small" onClick={() => edit(record)}>Sửa</Button>
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.storeProductId)}>Xóa</Button>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Modal
      title={`📦 Sản phẩm cửa hàng "${storeName}"`}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      width={1000}
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto", paddingBottom: "1rem" }}
      maskClosable={false}
      destroyOnClose
    >
      {/* Form thêm mới */}
      <AddProductForm
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        allProducts={allProducts}
        onAdd={handleAdd}
        onRefresh={handleRefresh}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      {/* Table */}
      <Form form={form} component={false}>
        <Table
          dataSource={filteredProducts}
          columns={mergedColumns}
          rowKey="storeProductId"
          loading={loading}
          bordered
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          components={{ body: { cell: EditableCell } }}
        />
      </Form>
    </Modal>
  );
};

export default StoreProductsModal;
import React, { useEffect, useState } from "react";
import { Modal, Table, Button, InputNumber, Select, Tooltip } from "antd";
import { PlusCircle, Trash2, X } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductIngredientsModal = ({ isOpen, onClose, onSuccess, editItem }) => {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [data, setData] = useState([]);
  const [newIngredient, setNewIngredient] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/Ingredient");
      setIngredients(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách nguyên liệu!");
    }
  };

  const fetchProductIngredients = async () => {
    if (!editItem) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/ProductIngredients/product/${editItem.productId}`
      );
      setData(res.data || []);
    } catch {
      toast.error("Không thể tải nguyên liệu cho sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIngredients();
      fetchProductIngredients();
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!newIngredient || !quantity) {
      toast.error("Vui lòng chọn nguyên liệu và nhập số lượng!");
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/ProductIngredients", {
        productId: editItem.productId,
        ingredientId: newIngredient,
        quantity,
      });
      toast.success("Thêm nguyên liệu thành công!");
      await fetchProductIngredients();
      setNewIngredient(null);
      setQuantity(1);
      onSuccess?.("add");
    } catch (err) {
      toast.error(err.response?.data?.message || "Thêm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (piId, newQty) => {
    try {
      await axios.put(`http://localhost:5000/api/ProductIngredients/${piId}`, {
        productId: editItem.productId,
        ingredientId: data.find((x) => x.productIngredientId === piId)?.ingredientId,
        quantity: newQty,
      });
      toast.success("Cập nhật thành công!");
      await fetchProductIngredients();
      onSuccess?.("edit");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleDelete = async (piId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/ProductIngredients/${piId}`);
      toast.success("Xóa thành công!");
      await fetchProductIngredients();
      onSuccess?.("delete");
    } catch {
      toast.error("Không thể xóa!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        closable={false}
        footer={null}
        width={850}
        className="rounded-lg p-6"
        title={
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-indigo-700">
              Quản lý nguyên liệu:{" "}
              <span className="text-gray-800">{editItem?.productName}</span>
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <X size={22} />
            </button>
          </div>
        }
      >
        {/* Form thêm nguyên liệu */}
        <div className="flex flex-wrap gap-4 mb-5 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Chọn nguyên liệu
            </label>
            <Select
              showSearch
              placeholder="Chọn nguyên liệu..."
              value={newIngredient}
              onChange={setNewIngredient}
              options={ingredients.map((ing) => ({
                value: ing.ingredientId,
                label: ing.ingredientName,
              }))}
              className="w-full"
            />
          </div>
          <div className="w-32">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Số lượng
            </label>
            <InputNumber
              min={0.01}
              step={0.01}
              value={quantity}
              onChange={setQuantity}
              className="w-full"
            />
          </div>
          <Button
            type="primary"
            onClick={handleAdd}
            loading={loading}
            icon={<PlusCircle size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
          >
            Thêm
          </Button>
        </div>

        {/* Table danh sách nguyên liệu */}
        <Table
          dataSource={data}
          rowKey="productIngredientId"
          pagination={false}
          loading={loading}
          bordered
          className="shadow-sm rounded-lg"
          columns={[
            { title: "STT", render: (_, __, index) => index + 1, width: 60, align: "center" },
            { title: "Nguyên liệu", dataIndex: "ingredientName", key: "ingredientName" },
            {
              title: "Số lượng",
              key: "quantity",
              render: (_, record) => (
                <InputNumber
                  min={0.01}
                  step={0.01}
                  value={record.quantity}
                  onChange={(val) => handleUpdateQuantity(record.productIngredientId, val)}
                />
              ),
            },
            {
              title: "Hành động",
              key: "actions",
              align: "center",
              render: (_, record) => (
                <Tooltip title="Xóa nguyên liệu">
                  <Button
                    danger
                    type="text"
                    icon={<Trash2 size={18} />}
                    onClick={() => handleDelete(record.productIngredientId)}
                  />
                </Tooltip>
              ),
            },
          ]}
        />
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default ProductIngredientsModal;

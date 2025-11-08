import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ProductIngredientsModal = ({ isOpen, onClose, onSuccess, editItem }) => {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ productId: "", ingredientId: "", quantity: "" });
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    try {
      const [prodRes, ingRes] = await Promise.all([
        axios.get("http://localhost:5000/api/Products/all-products"),
        axios.get("http://localhost:5000/api/Ingredient"),
      ]);

      setProducts(prodRes.data.map(p => ({ id: p.productId, name: p.productName })));
      setIngredients(ingRes.data.map(i => ({ id: i.ingredientId, name: i.ingredientName })));
    } catch (err) {
      toast.error("Lấy dữ liệu dropdown thất bại!");
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (editItem) {
        setForm({
          productId: editItem.productId,
          ingredientId: editItem.ingredientId,
          quantity: editItem.quantity,
        });
      } else {
        setForm({ productId: "", ingredientId: "", quantity: "" });
      }
    }
  }, [isOpen, editItem]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.productId || !form.ingredientId || !form.quantity) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const payload = {
      productId: Number(form.productId),
      ingredientId: Number(form.ingredientId),
      quantity: Number(form.quantity),
    };

    try {
      setLoading(true);
      if (editItem) {
        await axios.put(`http://localhost:5000/api/ProductIngredients/${editItem.productIngredientId}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:5000/api/ProductIngredients", payload);
        toast.success("Thêm mới thành công!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-96 p-6 relative">
        <h3 className="text-lg font-semibold mb-4">{editItem ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu"}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block mb-1">Sản phẩm</label>
            <select name="productId" value={form.productId} onChange={handleChange} className="w-full border px-2 py-1 rounded">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Nguyên liệu</label>
            <select name="ingredientId" value={form.ingredientId} onChange={handleChange} className="w-full border px-2 py-1 rounded">
              <option value="">-- Chọn nguyên liệu --</option>
              {ingredients.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Số lượng</label>
            <input type="number" min="0" name="quantity" value={form.quantity} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">Hủy</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductIngredientsModal;

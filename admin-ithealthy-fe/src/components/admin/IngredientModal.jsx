// src/components/admin/IngredientModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Input, InputNumber, Switch, Button, Upload, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";

const IngredientModal = ({ visible, onClose, ingredient, onSaved }) => {
  const [form, setForm] = useState({
    ingredientName: "",    // Tên nguyên liệu (string) - bắt buộc
    unit: "",              // Đơn vị (string, ví dụ: "kg", "g", "chai") - bắt buộc
    basePrice: 0,          // Giá gốc (number, vnđ)
    calories: 0,           // Calories (number)
    protein: 0,            // Protein (number, g)
    carbs: 0,              // Carbs (number, g)
    fat: 0,                // Fat (number, g)
    imageIngredients: "",  // URL ảnh (string) nếu muốn nhập trực tiếp
    imageFile: null,       // File ảnh upload mới
    isAvailable: true,     // Còn hàng hay hết hàng (boolean)
  });

  useEffect(() => {
    if (ingredient) {
      setForm({
        ingredientName: ingredient.ingredientName,
        unit: ingredient.unit,
        basePrice: ingredient.basePrice,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fat: ingredient.fat,
        imageIngredients: ingredient.imageIngredients || "",
        imageFile: null,
        isAvailable: ingredient.isAvailable ?? true,
      });
    } else {
      setForm({
        ingredientName: "",
        unit: "",
        basePrice: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        imageIngredients: "",
        imageFile: null,
        isAvailable: true,
      });
    }
  }, [ingredient]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    if (!form.ingredientName || !form.unit) {
      toast.warning("Vui lòng điền tên nguyên liệu và đơn vị!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("IngredientName", form.ingredientName);
      formData.append("Unit", form.unit);
      formData.append("BasePrice", form.basePrice);
      formData.append("Calories", form.calories);
      formData.append("Protein", form.protein);
      formData.append("Carbs", form.carbs);
      formData.append("Fat", form.fat);
      formData.append("IsAvailable", form.isAvailable);

      if (form.imageFile) formData.append("ImageIngredients", form.imageFile);
      else if (form.imageIngredients) formData.append("ImageIngredients", form.imageIngredients);

      if (ingredient) {
        await axios.put(`http://localhost:5000/api/ingredient/${ingredient.ingredientId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật nguyên liệu thành công!");
      } else {
        await axios.post("http://localhost:5000/api/ingredient", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm nguyên liệu thành công!");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleDelete = async () => {
    if (!ingredient) return;
    try {
      await axios.delete(`http://localhost:5000/api/ingredient/${ingredient.ingredientId}`);
      toast.success("Đã xóa nguyên liệu thành công!");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xóa nguyên liệu!");
    }
  };

  return (
    <Modal
      title={ingredient ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu"}
      open={visible}
      onCancel={onClose}
      footer={[
        ingredient && (
          <Button danger key="delete" onClick={handleDelete}>
            Xóa
          </Button>
        ),
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Lưu
        </Button>,
      ]}
    >
      {/* Tên nguyên liệu (bắt buộc) */}
      <Input
        placeholder="Tên nguyên liệu (ví dụ: Sữa tươi, Bột cacao)"
        value={form.ingredientName}
        onChange={(e) => handleChange("ingredientName", e.target.value)}
        className="mb-2"
      />

      {/* Đơn vị (bắt buộc) */}
      <Input
        placeholder="Đơn vị (ví dụ: kg, g, chai)"
        value={form.unit}
        onChange={(e) => handleChange("unit", e.target.value)}
        className="mb-2"
      />

      {/* Giá gốc */}
      <InputNumber
        placeholder="Giá gốc (vnđ)"
        value={form.basePrice}
        onChange={v => handleChange("basePrice", v)}
        className="mb-2 w-full"
      />

      {/* Dinh dưỡng */}
      <InputNumber placeholder="Calories" value={form.calories} onChange={v => handleChange("calories", v)} className="mb-2 w-full" />
      <InputNumber placeholder="Protein (g)" value={form.protein} onChange={v => handleChange("protein", v)} className="mb-2 w-full" />
      <InputNumber placeholder="Carbs (g)" value={form.carbs} onChange={v => handleChange("carbs", v)} className="mb-2 w-full" />
      <InputNumber placeholder="Fat (g)" value={form.fat} onChange={v => handleChange("fat", v)} className="mb-2 w-full" />

      {/* Upload ảnh */}
      <Upload
        beforeUpload={file => {
          handleChange("imageFile", file);
          return false;
        }}
        accept="image/*"
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} className="mb-2 w-full">
          Chọn ảnh (hoặc điền URL ở dưới)
        </Button>
      </Upload>

      {/* Preview ảnh */}
      {form.imageFile ? (
        <Image src={URL.createObjectURL(form.imageFile)} width={120} height={120} alt="preview" className="mb-2" />
      ) : form.imageIngredients ? (
        <Image src={form.imageIngredients} width={120} height={120} alt="preview" className="mb-2" />
      ) : null}

      {/* URL ảnh (không bắt buộc nếu upload file) */}
      <Input
        placeholder="Link ảnh (nếu không upload)"
        value={form.imageIngredients}
        onChange={(e) => handleChange("imageIngredients", e.target.value)}
        className="mb-2"
      />

      {/* Trạng thái còn hàng */}
      <div className="flex items-center mt-2">
        <span className="mr-2">Còn hàng:</span>
        <Switch
          checked={form.isAvailable}
          onChange={checked => handleChange("isAvailable", checked)}
        />
      </div>
    </Modal>
  );
};

export default IngredientModal;

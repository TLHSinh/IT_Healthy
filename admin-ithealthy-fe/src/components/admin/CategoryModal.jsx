import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const CategoryModal = ({ isOpen, onClose, onSave, category, type }) => {
  const [form, setForm] = useState({
    categoryName: "",
    descriptionCat: "",
    imageCategories: "",
  });

  useEffect(() => {
    if (category) {
      setForm({
        categoryName: category.categoryName || "",
        descriptionCat: category.descriptionCat || "",
        imageCategories: category.imageCategories || "",
      });
    } else {
      setForm({
        categoryName: "",
        descriptionCat: "",
        imageCategories: "",
      });
    }
  }, [category]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryName) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-600 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
          {category ? "Cập nhật" : "Thêm"} loại{" "}
          {type === "product" ? "sản phẩm" : "nguyên liệu"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên danh mục
            </label>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="Nhập tên danh mục..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả danh mục
            </label>
            <textarea
              name="descriptionCat"
              value={form.descriptionCat}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              rows="3"
              placeholder="Nhập mô tả..."
            />
          </div>

          {type === "product" && (
            <div>
              <label className="block text-sm font-medium mb-1">Ảnh</label>
              <input
                type="text"
                name="imageCategories"
                value={form.imageCategories}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="URL ảnh danh mục..."
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-2"
          >
            {category ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;


// import React, { useState, useEffect } from "react";
// import { X, ImagePlus } from "lucide-react";
// import { toast } from "react-hot-toast";

// const CategoryModal = ({ isOpen, onClose, onSave, category, type }) => {
//   const [form, setForm] = useState({
//     categoryName: "",
//     descriptionCat: "",
//     imageCategories: "",
//   });

//   const [preview, setPreview] = useState("");

//   useEffect(() => {
//     if (category) {
//       setForm({
//         categoryName: category.categoryName || "",
//         descriptionCat: category.descriptionCat || "",
//         imageCategories: category.imageCategories || "",
//       });
//       setPreview(category.imageCategories || "");
//     } else {
//       setForm({
//         categoryName: "",
//         descriptionCat: "",
//         imageCategories: "",
//       });
//       setPreview("");
//     }
//   }, [category]);

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   // 📸 Khi người dùng chọn ảnh
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Giới hạn kích thước ảnh (tuỳ chọn)
//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("Ảnh quá lớn! Giới hạn 2MB.");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setForm({ ...form, imageCategories: reader.result });
//       setPreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.categoryName) {
//       toast.error("Vui lòng nhập tên danh mục!");
//       return;
//     }
//     await onSave(form);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-4 text-gray-600 hover:text-red-500"
//         >
//           <X />
//         </button>

//         <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
//           {category ? "Cập nhật" : "Thêm"} loại{" "}
//           {type === "product" ? "sản phẩm" : "nguyên liệu"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Tên danh mục
//             </label>
//             <input
//               type="text"
//               name="categoryName"
//               value={form.categoryName}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2"
//               placeholder="Nhập tên danh mục..."
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Mô tả danh mục
//             </label>
//             <textarea
//               name="descriptionCat"
//               value={form.descriptionCat}
//               onChange={handleChange}
//               className="w-full border rounded-lg p-2"
//               rows="3"
//               placeholder="Nhập mô tả..."
//             />
//           </div>

//           {type === "product" && (
//             <div>
//               <label className="block text-sm font-medium mb-2">Ảnh danh mục</label>

//               {/* Hiển thị ảnh preview */}
//               {preview ? (
//                 <div className="mb-3 flex flex-col items-center gap-2">
//                   <img
//                     src={preview}
//                     alt="preview"
//                     className="w-32 h-32 object-cover rounded-lg border"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setForm({ ...form, imageCategories: "" });
//                       setPreview("");
//                     }}
//                     className="text-sm text-red-500 hover:underline"
//                   >
//                     Xóa ảnh
//                   </button>
//                 </div>
//               ) : (
//                 <label
//                   htmlFor="fileUpload"
//                   className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg text-gray-500 cursor-pointer hover:bg-gray-50 transition"
//                 >
//                   <ImagePlus className="mr-2" size={20} />
//                   Chọn ảnh từ thiết bị
//                 </label>
//               )}

//               <input
//                 id="fileUpload"
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//             </div>
//           )}

//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-2"
//           >
//             {category ? "Cập nhật" : "Thêm mới"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CategoryModal;

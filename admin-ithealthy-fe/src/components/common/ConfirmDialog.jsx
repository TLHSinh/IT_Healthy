// src/components/common/ConfirmDialog.jsx
import React, { useEffect } from "react";

const ConfirmDialog = ({
  title = "Xác nhận",
  message = "Bạn có chắc muốn thực hiện hành động này?",
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
}) => {
  // 👉 Thoát khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // 👉 Dừng propagation khi click trong modal
  const handleClickInside = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        onClick={handleClickInside}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-scaleIn"
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

/* ✅ Thêm CSS animation (nếu dùng Tailwind, thêm vào index.css)
-----------------------------------
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
.animate-scaleIn { animation: scaleIn 0.25s ease-in-out; }
-----------------------------------
*/

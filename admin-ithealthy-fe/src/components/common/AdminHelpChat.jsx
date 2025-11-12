import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const guides = [
  { keyword: ["store", "cửa hàng", "chi nhánh", "tồn kho",], title: "📦 Trang Store Management", desc: "Quản lý danh sách Chi nhánh, xem Tồn kho, kho Sản phẩm, Thêm/xóa/sửa thông tin cửa hàng." },
  { keyword: ["ingredient", "nguyên liệu", "bếp", "thực phẩm"], title: "🥦 Trang Ingredients", desc: "Quản lý nguyên liệu sản phẩm, có thể thêm ảnh, đơn vị và mô tả chi tiết." },
  { keyword: ["product", "sản phẩm", "menu"], title: "🛒 Trang Products", desc: "Quản lý danh sách sản phẩm, gán nguyên liệu và giá bán." },
  { keyword: ["dashboard", "thống kê", "doanh thu", "biểu đồ"], title: "📊 Dashboard", desc: "Hiển thị doanh thu, lượng bán, sản phẩm phổ biến và tồn kho." },
  { keyword: ["user", "người dùng", "tài khoản", "phân quyền"], title: "👥 Trang Users", desc: "Xem danh sách người dùng, phân quyền và trạng thái hoạt động." },
];

const quickSuggestions = [
  { label: "Store", keyword: "store" },
  { label: "Ingredients", keyword: "ingredient" },
  { label: "Products", keyword: "product" },
  { label: "Dashboard", keyword: "dashboard" },
  { label: "Users", keyword: "user" },
];

const AdminHelpChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Chào bạn! Gõ câu hỏi hoặc chọn gợi ý để mình hướng dẫn nhé 😊" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Scroll mượt
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    // Tin nhắn user
    setMessages((prev) => [...prev, { from: "user", text }]);

    const lowerText = text.toLowerCase();
    const match = guides.find((g) => g.keyword.some((k) => lowerText.includes(k)));
    const botReply = match ? `${match.title}\n${match.desc}` : "❌ Không tìm thấy hướng dẫn phù hợp. Hãy thử từ khóa khác!";

    // Typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
      setIsTyping(false);
    }, 800); // 800ms giả lập bot đang gõ
  };

  const handleSend = () => { sendMessage(input); setInput(""); };
  const handleKeyPress = (e) => { if (e.key === "Enter") handleSend(); };
  const handleQuickClick = (keyword) => sendMessage(keyword);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Nút mở/đóng chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg text-white transition-all duration-300 ${
          isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 text-center bg-gradient-to-r from-green-200 to-green-100 border-b shadow-sm">
            <h4 className="text-lg font-bold text-green-800">💬 Trợ lý IT Healthy</h4>
            <p className="text-xs text-gray-600">Gõ câu hỏi hoặc chọn gợi ý bên dưới</p>
          </div>

          {/* Body */}
            <div
            className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100"
            ref={scrollRef}
            >
            {messages.map((msg, idx) => (
            <div
                key={idx}
                className={`flex items-start gap-2 max-w-[75%] animate-fadeIn ${
                msg.from === "bot"
                    ? "self-start mr-auto"
                    : "self-end flex-row-reverse ml-auto"
                }`}
            >
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {msg.from === "bot" ? "B" : "U"}
                </div>
                <div
                className={`p-2 rounded-xl break-words whitespace-pre-line shadow-sm ${
                    msg.from === "bot"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-green-100 text-green-800"
                }`}
                >
                {msg.text}
                </div>
            </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
                <div className="flex items-center gap-2 self-start animate-pulse">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    B
                </div>
                <div className="bg-gray-100 text-gray-800 p-2 rounded-xl flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                </div>
                </div>
            )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1 p-2 border-t bg-gray-50">
            {quickSuggestions.map((q, idx) => (
                <button
                key={idx}
                onClick={() => handleQuickClick(q.keyword)}
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 shadow-sm text-xs transition"
                >
                {q.label}
                </button>
            ))}
            </div>

            {/* Input */}
            <div className="flex border-t p-2 gap-2">
            <input
                type="text"
                placeholder="Gõ câu hỏi hoặc từ khóa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            />
            <button
                onClick={handleSend}
                className="bg-green-600 text-white px-3 py-1 rounded-xl hover:bg-green-700 transition shadow"
            >
                Gửi
            </button>
            </div>

            </div>
      )}
    </div>
  );
};

export default AdminHelpChat;

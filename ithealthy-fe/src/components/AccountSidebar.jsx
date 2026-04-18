// components/AccountSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  User,
  ShoppingCart,
  CreditCard,
  Lock,
  MessageSquare,
  Heart,
  HeartPulse,
} from "lucide-react";

const menu = [
  { label: "Tài khoản", to: "/profile", icon: User },
  { label: "Lịch sử đơn hàng", to: "/CustomerOrders", icon: ShoppingCart },
  { label: "Tạo món của bạn", to: "/farvorite", icon: Heart },
  { label: "Theo dõi sức khỏe", to: "/health-monitoring", icon: HeartPulse },
  // { label: "Mật khẩu và bảo mật", to: "/account/security", icon: Lock },
  // { label: "Bình luận của tôi", to: "/account/comments", icon: MessageSquare },
];

export default function AccountSidebar() {
  return (
    <aside className="col-span-3 bg-white rounded-2xl shadow p-4 space-y-1">
      {menu.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition
             ${
               isActive
                 ? "bg-blue-50 text-blue-600"
                 : "text-gray-600 hover:bg-gray-100"
             }`
          }
        >
          <Icon className="w-4 h-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}



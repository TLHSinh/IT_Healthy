import { Outlet } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-[#F8F4E9] p-6">
      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <AccountSidebar />
        </aside>

        {/* Main content */}
        <main className="col-span-12 md:col-span-9 bg-white rounded-2xl shadow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StoreManagement from "./pages/admin/StoreManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import CategoryIngManagement from "./pages/admin/CategoryIngManagement";

//import StoreInventoryManagement from "./pages/admin/StoreInventoryManagement";
import IngredientManagement from "./pages/admin/IngredientManagement";
import ProductIngredientsManagement from "./pages/admin/ProductIngredientsManagement";



import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <Router>
      {/* Toast container chỉ cần 1 lần, đặt ở đây để toàn app dùng */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Trang đăng nhập riêng */}
        <Route path="/" element={<AdminLogin />} />

        {/* Tất cả các trang trong hệ thống admin đều dùng chung layout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staffs" element={<StaffManagement />} />
          <Route path="/admin/stores" element={<StoreManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/category" element={<CategoryManagement />} />
          <Route path="/admin/category-ing" element={<CategoryIngManagement />} />

          
          {/* <Route path="/admin/store-inventory" element={<StoreInventoryManagement />} /> */}

          {/* <Route path="/admin/store-inventory/:storeId" element={<StoreInventoryManagement />} /> */}




          <Route path="/admin/ingredients" element={<IngredientManagement />} />
          <Route path="/admin/product-ingredients" element={<ProductIngredientsManagement />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import ProductPage from "../pages/ProductPage";
import CalocalculatorPage from "../pages/CalocalculatorPage";
import AboutusPage from "../pages/AboutusPage";
import StoresPage from "../pages/StoresPage";
import BlogsPage from "../pages/BlogsPage";
import CreateYourBowlPage from "../pages/CreateYourBowlPage";

import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout có Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signature-bowls" element={<ProductPage />} />
          <Route path="/calories" element={<CalocalculatorPage />} />
          <Route path="/aboutus" element={<AboutusPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/createyourbowl" element={<CreateYourBowlPage />} />
        </Route>

        {/* Trang không có Navbar */}
        <Route path="/login-user" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

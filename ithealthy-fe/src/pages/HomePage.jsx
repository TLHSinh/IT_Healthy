import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import '../pages/HomePage.css';
import { motion, useInView, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";
import MealCarousel from "../components/FoodCarousel";
import ImageCardGallery from "../components/ImageCardGallery";
import ImageAdv from "../components/ImageAdv";
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

export default function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login-user");
  };
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: "-100px" });

  return (
    <div className="main-hp">
      <div className="flex justify-center items-center h-screen bg-gray-50 relative">
        {/* <h1 className="text-3xl font-bold text-gray-700">TRANG CHỦ</h1> */}
        <div className="video-container">
          <video autoPlay loop muted plays-inline class="back-vid">
            <source src="/video1_homepage.mp4" type="video/mp4" />
          </video>
          <div className="content1-homepage">
            <h1 className="homepage-title">Nâng niu sức khỏe của bạn</h1>
            <a href="aboutus">Tìm hiểu thêm</a>
          </div>
        </div>

        {/* Nút trên góc phải */}
        {/* <div className="absolute top-5 right-5">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                Xin chào, {user.fullName || "Người dùng"} 👋
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login-user"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Đăng nhập
            </Link>
          )}
        </div> */}
      </div>
      <section className="container-content2-hp" ref={sectionRef}>
        {/* SVG hai bên */}
        <motion.img
          src="/svg/1.svg"
          alt="veggie-left-1"
          className="svg-left svg-1"
          initial={{ x: 100, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.img
          src="/svg/4.svg"
          alt="veggie-left-2"
          className="svg-left svg-2"
          initial={{ x: 150, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />

        <motion.img
          src="/svg/5.svg"
          alt="veggie-right-1"
          className="svg-right svg-3"
          initial={{ x: -100, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.img
          src="/svg/7.svg"
          alt="veggie-right-2"
          className="svg-right svg-4"
          initial={{ x: -150, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />

        {/* Content giữa */}
        <div className="content2-inner">
          <h1>Your healthy food soulmate</h1>
          <p>
            Soumaki mong trở thành một tri kỷ, cùng bạn nuôi dưỡng tình yêu với
            bản thân và thắt chặt mối quan hệ với thực phẩm lành mạnh. Chân ái
            ngon-lành của bạn ở ngay đây rồi.
          </p>
        </div>
      </section>

      <section className="container-content3-hp">
        <div className="content3-inner">
          <p>SÁNG TẠO THỎA THÍCH VỚI MENU ĐA DẠNG</p>
          <h1>Xây dựng thực đơn lành mạnh</h1>
          <p>KIỂM SOÁT CALO NHẬP VÀO CƠ THỂ</p>
        </div>
        <ImageCardGallery />
        <div className="gallery-button-container">
          <button
            className="go-calories-btn"
            onClick={() => navigate("/calories")}
          >
            Tính calo ngay
          </button>
        </div>
      </section>

      <section className="container-content4-hp">
        <div className="content3-inner">
          <p>HOẶC CHỌN PHẦN ĂN THIẾT KẾ SẴN TRONG MENU</p>
          <h1>Sou-made bowls</h1>
        </div>
        <MealCarousel />

        <div className="text-center">
          <button
            onClick={() => navigate("/signature-bowls")}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-lg mt-10"
          >
            Xem thêm
          </button>
        </div>
      </section>

      <section className="container-content5-hp">
        <ImageAdv />
      </section>


      <section className="container-content6-hp">
        <div className="content6-inner">
          <h2>SỨ MỆNH CỦA CHÚNG TÔI</h2>
          <h1>Cùng bạn, nuôi dưỡng mối quan hệ lành mạnh với thực phẩm</h1>
          <p>
            Thông qua món ăn tròn vị, đủ chất được chăm chút gửi đến bạn, IT Healthy mong được đồng hành cùng bạn nâng niu sức khoẻ và khởi đầu hành trình ăn lành – sống xanh.
          </p>
          
          <div className="image-container6-hp">
            <img src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web_Our-Story-1024x614.webp" alt="mission-image" />
          </div>

        </div>
      </section>


    </div>
  );
}

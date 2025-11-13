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
    <div className="main">
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

<footer className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <p className="text-sm mb-3 opacity-90">Bạn có câu hỏi? Liên hệ IT Healthy nhé!</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            info@ithealthy.com.vn
          </h2>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="text-center space-y-3">
            <p className="font-semibold">10 AM – 9 PM mỗi ngày</p>
            <p>Mời bạn đến dùng bữa!</p>
            <button 
            onClick={() => navigate("/stores")}
            className="mt-4 px-6 py-2 border-2 border-white rounded-full hover:bg-white hover:text-emerald-500 transition-colors duration-300">
              Tìm cửa hàng
            </button>
          </div>

          
          <div className="text-center space-y-3">
            <p className="font-semibold">Đói bụng? Thèm món healthy?</p>
            <p>Đặt ngay trên các ứng dụng</p>
            <div className="flex justify-center items-center gap-4 mt-4">

              <div className=" rounded-lg px-3 py-2">
                <img className="logo-delivery"
                src="https://soumaki.com.vn/wp-content/uploads/2024/03/grabfood-logo.svg"/>
              </div>
              
              <div className=" rounded-lg px-3 py-2">
                <img className="logo-delivery"
                src="https://soumaki.com.vn/wp-content/uploads/2024/03/shopeefood-logo.svg"/>
              </div>
           
              <div className=" rounded-lg px-3 py-2" >
                <img className= "logo-befood"
                src="https://soumaki.com.vn/wp-content/uploads/2024/03/d-3-300x101.png"/>
              </div>
            </div>
          </div>

          
          <div className="text-center space-y-3">
            <p className="font-semibold">Giữ liên lạc nhé!</p>
            <p>Kết nối trên các nền tảng</p>
            <div className="flex justify-center gap-4 mt-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-emerald-500" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-emerald-500" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                aria-label="Zalo"
              >
                <MessageCircle className="w-5 h-5 text-emerald-500" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                aria-label="Phone"
              >
                <Phone className="w-5 h-5 text-emerald-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-white border-opacity-30 border-dotted my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm opacity-90">
          <p className="mb-4 md:mb-0">Đồng hành cùng bạn, từ 2020.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Giao hàng</a>
            <a href="#" className="hover:underline">Hỏi Đáp</a>
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <a href="#" className="hover:underline">Các điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}

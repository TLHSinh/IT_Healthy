import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
export function Footer(params) {
    const navigate = useNavigate();
    return (
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
    )
}
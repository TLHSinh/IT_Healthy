import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import "./ImageAdv.css";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const TextImageCarousel = () => {
  const slides = [
    {
      id: 1,
      title: 'Thịt sous-vide mới toanh',
      subtitle: 'MỚI',
      description: 'Xin long trọng giới thiệu hai siêu phẩm mới hạ cánh tại IT Healthy. Đây vẫn là những món thịt chất lượng được Soumaki “chăm sóc” bằng phương pháp sous-vide, nấu chậm 4 giờ để dinh dưỡng thấm đẫm trong thớ thịt và thăng hạng vị ngon nguyên bản!',
      image: 'https://soumaki.com.vn/wp-content/uploads/2024/05/L4-Bowls-scaled.webp',
    },
    {
      id: 2,
      title: 'Tiệc tối thân mật cùng Sou-mates!',
      subtitle: 'MỚI',
      description: 'Quây quần trong không gian tươi xanh, căng tràn sự ngon-lành, Soumaki cùng sou-mate của mình kể những chuyện cũ mới và gửi vài dòng đến tương lai.',
      image: 'https://soumaki.com.vn/wp-content/uploads/2024/05/TNU_9289m-scaled.webp'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{
            type: 'fraction',
            formatFractionCurrent: (number) => String(number).padStart(2, '0'),
            formatFractionTotal: (number) => String(number).padStart(2, '0')
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="mySwiper"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="grid md:grid-cols-2 gap-8 items-center min-h-[500px] py-8">
                {/* Left Side - Text Content */}
                <div className="space-y-6 px-8">
                  <div className="space-y-2">
                    <p className="text-green-600 font-semibold text-sm uppercase tracking-wider">
                      {slide.subtitle}
                    </p>
                    <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                      {slide.title}
                    </h2>
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {slide.description}
                  </p>
                  
                </div>

                {/* Right Side - Image */}
                <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TextImageCarousel;
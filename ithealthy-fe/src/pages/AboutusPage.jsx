
export default function AboutusPage() {
  return (
    <div className='main-au' >
      <section className="min-h-screen bg-[#f5edd8] flex items-center justify-center px-4 pt-5">
      <div className="max-w-5xl mx-auto text-center">
        {/* Small heading */}
        <p className="text-[#4C082A] text-sm md:text-base font-semibold tracking-widest uppercase mb-6">
          CÂU CHUYỆN
        </p>

        {/* Main heading */}
        <h1 className="text-[#531b2a] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Soumaki tin rằng những bữa ăn lành mạnh là cách đơn giản nhất để yêu thương chính mình
        </h1>

        {/* Decorative line */}
        <div className="mt-12 w-24 h-1 bg-gradient-to-r from-[#a52a5a] to-[#d4527a] mx-auto rounded-full" />
      </div>
    </section>
      <section className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web-About_About-4-jpg.webp"
            alt="Healthy Food"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center px-8 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="text-white text-xs md:text-sm font-semibold tracking-widest uppercase mb-4">
              SỨ MỆNH
            </p>

            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Nuôi dưỡng mối quan hệ lành mạnh với thực phẩm
            </h2>

            <p className="text-white text-base md:text-lg leading-relaxed max-w-lg">
              Thông qua món ăn tròn vị, đủ chất được chăm chút gửi đến bạn, Soumaki mong được đồng hành cùng bạn nâng niu sức khoẻ và khởi đầu hành trình ăn lành – sống xanh. Hãy để những bữa ăn ngon–lành làm điểm giao giữa bạn với phiên bản tương lai tràn đầy năng lượng và hạnh phúc nhé!
            </p>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 bg-[#f5edd8]">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <h2 className="text-[#531b2a] text-3xl md:text-4xl font-bold text-center mb-16">
            GIÁ TRỊ SOUMAKI THEO ĐUỔI
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="aspect-[3/4] relative">
                <img
                  src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web-About_About-5-jpg.webp"
                  alt="Nấu bằng tình yêu & tâm huyết"
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[#F5EDD8] text-xl md:text-2xl font-bold leading-tight">
                    Nấu bằng tình yêu<br />& tâm huyết
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="aspect-[3/4] relative">
                <img
                  src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web-About_About-5-copy-jpg.webp"
                  alt="Cá nhân hoá trải nghiệm"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[#F5EDD8] text-xl md:text-2xl font-bold leading-tight">
                    Cá nhân hoá<br />trải nghiệm
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="aspect-[3/4] relative">
                <img
                  src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web-About_About-5-copy-2-jpg.webp"
                  alt="Gắn kết bền vững & lâu dài"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[#F5EDD8] text-xl md:text-2xl font-bold leading-tight">
                    Gắn kết bền vững<br />& lâu dài
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="aspect-[3/4] relative">
                <img
                  src="https://soumaki.com.vn/wp-content/uploads/2024/05/Pic-Web-About_About-5-copy-3-jpg.webp"
                  alt="Nối lời ngon tiếng ngoạt"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[#F5EDD8] text-xl md:text-2xl font-bold leading-tight">
                    Nối lời ngon<br />tiếng ngọt
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function HomePage() {
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeCategory, setActiveCategory] = useState("All");

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch("http://localhost:5000/api/blog/all")
//       .then((res) => res.json())
//       .then((data) => {
//         setBlogs(data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   // Lấy category
//   const categories = ["All", ...new Set(blogs.map((b) => b.category))];

//   // Filter
//   const filteredBlogs =
//     activeCategory === "All"
//       ? blogs
//       : blogs.filter((b) => b.category === activeCategory);

//   return (
//     <div className="bg-[#f5f0e8] min-h-screen">

//       {/* 🔥 HERO */}
//       <div className="relative h-[520px]">
//         <img
//           src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
//           className="w-full h-full object-cover"
//         />

//         <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex flex-col justify-center items-center text-center text-white px-4">
//           <h1 className="text-5xl font-extrabold mb-4">
//             Healthy Blog
//           </h1>

//           <p className="max-w-xl mb-6 text-lg opacity-90">
//             Khám phá dinh dưỡng, fitness và lối sống lành mạnh mỗi ngày
//           </p>

//           <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full shadow-xl transition">
//             Khám phá ngay
//           </button>
//         </div>
//       </div>

//       {/* 🔥 FEATURED */}
//       <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">
//         {!loading && blogs.length > 0 && (
//           <div
//             onClick={() => navigate(`/blog/${blogs[0].blogId}`)}
//             className="bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 cursor-pointer hover:scale-[1.01] transition"
//           >
//             <img
//               src={blogs[0].image}
//               className="h-full w-full object-cover"
//             />

//             <div className="p-10 flex flex-col justify-center">
//               <span className="text-orange-500 font-semibold mb-2 uppercase text-sm">
//                 {blogs[0].category}
//               </span>

//               <h2 className="text-3xl font-bold mb-4">
//                 {blogs[0].title}
//               </h2>

//               <p className="text-gray-600 mb-6">
//                 {blogs[0].description}
//               </p>

//               <button className="bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-800">
//                 Đọc thêm
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* 🔥 BLOG LIST */}
//       <div className="max-w-6xl mx-auto px-6 py-20">

//         <h2 className="text-2xl font-bold mb-6">
//           Bài viết mới nhất
//         </h2>

//         {/* 🔥 FILTER */}
//         <div className="flex flex-wrap gap-3 mb-10">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setActiveCategory(cat)}
//               className={`px-4 py-2 rounded-full text-sm border transition 
//                 ${
//                   activeCategory === cat
//                     ? "bg-orange-500 text-white border-orange-500"
//                     : "bg-white text-gray-600 hover:bg-orange-50"
//                 }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>

//         {/* 🔥 GRID */}
//         {loading ? (
//           <div className="grid md:grid-cols-3 gap-8">
//             {[...Array(6)].map((_, i) => (
//               <SkeletonCard key={i} />
//             ))}
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-3 gap-10">
//             {filteredBlogs.map((item) => (
//               <BlogCard key={item.blogId} item={item} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* 🔥 BLOG CARD */
// function BlogCard({ item }) {
//   const navigate = useNavigate();

//   return (
//     <div
//       onClick={() => navigate(`/blog/${item.blogId}`)}
//       className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 cursor-pointer"
//     >
//       <div className="overflow-hidden">
//         <img
//           src={
//             item.image ||
//             "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
//           }
//           className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
//         />
//       </div>

//       <div className="p-5">
//         <p className="text-xs text-orange-500 font-semibold mb-2 uppercase">
//           {item.category || "Blog"}
//         </p>

//         <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-500 transition">
//           {item.title}
//         </h3>

//         <p className="text-sm text-gray-500 line-clamp-2">
//           {item.description}
//         </p>
//       </div>
//     </div>
//   );
// }

// /* 🔥 SKELETON */
// function SkeletonCard() {
//   return (
//     <div className="bg-white rounded-2xl shadow animate-pulse overflow-hidden">
//       <div className="h-56 bg-gray-300"></div>
//       <div className="p-4 space-y-3">
//         <div className="h-4 bg-gray-300 w-1/3"></div>
//         <div className="h-5 bg-gray-300 w-2/3"></div>
//         <div className="h-4 bg-gray-300 w-full"></div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/blog") // ✅ API mới (REST)
      .then((res) => res.json())
      .then((data) => {
        // ✅ đảm bảo luôn là array (tránh lỗi map)
        const safeData = Array.isArray(data) ? data : [];

        // ✅ sort mới nhất trước (backup nếu BE chưa sort)
        safeData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBlogs(safeData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ✅ lấy category an toàn (fix case C# trả PascalCase)
  const categories = [
    "All",
    ...new Set(
      blogs.map((b) => b.category || b.Category || "Other")
    ),
  ];

  // ✅ filter an toàn
  const filteredBlogs =
    activeCategory === "All"
      ? blogs
      : blogs.filter(
          (b) =>
            (b.category || b.Category || "Other") === activeCategory
        );

  return (
    <div className="bg-[#f5f0e8] min-h-screen">

      {/* 🔥 HERO */}
      <div className="relative h-[520px]">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-5xl font-extrabold mb-4">
            Healthy Blog
          </h1>

          <p className="max-w-xl mb-6 text-lg opacity-90">
            Khám phá dinh dưỡng, fitness và lối sống lành mạnh mỗi ngày
          </p>

          <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full shadow-xl transition">
            Khám phá ngay
          </button>
        </div>
      </div>

      {/* 🔥 FEATURED */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">
        {!loading && blogs.length > 0 && (
          <div
            onClick={() => navigate(`/blog/${blogs[0].blogId}`)}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 cursor-pointer hover:scale-[1.01] transition"
          >
            <img
              src={blogs[0].image}
              className="h-full w-full object-cover"
            />

            <div className="p-10 flex flex-col justify-center">
              <span className="text-orange-500 font-semibold mb-2 uppercase text-sm">
                {blogs[0].category || blogs[0].Category}
              </span>

              <h2 className="text-3xl font-bold mb-4">
                {blogs[0].title}
              </h2>

              <p className="text-gray-600 mb-6">
                {blogs[0].description}
              </p>

              <button className="bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-800">
                Đọc thêm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 BLOG LIST */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        <h2 className="text-2xl font-bold mb-6">
          Bài viết mới nhất
        </h2>

        {/* 🔥 FILTER */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm border transition 
                ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 hover:bg-orange-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🔥 GRID */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {filteredBlogs.map((item) => (
              <BlogCard key={item.blogId} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔥 BLOG CARD */
function BlogCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/blog/${item.blogId}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 cursor-pointer"
    >
      <div className="overflow-hidden">
        <img
          src={
            item.image ||
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
          }
          className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div className="p-5">
        <p className="text-xs text-orange-500 font-semibold mb-2 uppercase">
          {item.category || item.Category || "Blog"}
        </p>

        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-500 transition">
          {item.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {item.description}
        </p>
      </div>
    </div>
  );
}

/* 🔥 SKELETON */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow animate-pulse overflow-hidden">
      <div className="h-56 bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 w-1/3"></div>
        <div className="h-5 bg-gray-300 w-2/3"></div>
        <div className="h-4 bg-gray-300 w-full"></div>
      </div>
    </div>
  );
}
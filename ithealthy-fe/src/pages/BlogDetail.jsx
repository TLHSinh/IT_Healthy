// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// export default function BlogDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [blog, setBlog] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/blog/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setBlog(data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [id]);

//   if (loading) {
//     return <div className="p-10 text-center">Loading...</div>;
//   }

//   if (!blog) {
//     return <div className="p-10 text-center">Không tìm thấy bài viết</div>;
//   }

//   return (
//     <div className="bg-white min-h-screen">

//       {/* 🔥 BACK BUTTON */}
//       <div className="max-w-4xl mx-auto px-6 pt-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-orange-500 hover:underline"
//         >
//           ← Quay lại
//         </button>
//       </div>

//       {/* 🔥 IMAGE */}
//       <div className="max-w-4xl mx-auto px-6 mt-4">
//         <img
//           src={blog.image}
//           className="w-full h-[400px] object-cover rounded-2xl shadow"
//         />
//       </div>

//       {/* 🔥 CONTENT */}
//       <div className="max-w-3xl mx-auto px-6 py-10">

//         <p className="text-sm text-orange-500 font-semibold mb-2 uppercase">
//           {blog.category}
//         </p>

//         <h1 className="text-4xl font-bold mb-6">
//           {blog.title}
//         </h1>

//         <p className="text-gray-600 mb-6 text-lg">
//           {blog.description}
//         </p>

//         {/* ⚠️ CONTENT HTML */}
//         <div
//           className="prose max-w-none"
//           dangerouslySetInnerHTML={{ __html: blog.content }}
//         />
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// export default function BlogDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [blog, setBlog] = useState(null);
//   const [related, setRelated] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Load blog detail
//     fetch(`http://localhost:5000/api/blog/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setBlog(data);

//         // Load related
//         fetch("http://localhost:5000/api/blog/all")
//           .then((res) => res.json())
//           .then((all) => {
//             const relatedBlogs = all
//               .filter(
//                 (b) =>
//                   b.blogId !== data.blogId &&
//                   b.category === data.category
//               )
//               .slice(0, 3);

//             setRelated(relatedBlogs);
//             setLoading(false);
//           });
//       })
//       .catch(() => setLoading(false));
//   }, [id]);

//   if (loading) {
//     return <div className="p-10 text-center">Loading...</div>;
//   }

//   if (!blog) {
//     return <div className="p-10 text-center">Không tìm thấy bài viết</div>;
//   }

//   return (
//     <div className="bg-[#f5f0e8] min-h-screen">

//       {/* 🔥 HERO */}
//       <div className="relative h-[500px]">
//         <img
//           src={blog.image}
//           className="w-full h-full object-cover"
//         />
// <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-between p-6 md:p-10 text-white">

//   {/* 🔥 TOP: BACK BUTTON */}
//   <div>
//     <button
//       onClick={() => {
//         if (window.history.length > 2) {
//           navigate(-1);
//         } else {
//           navigate("/");
//         }
//       }}
//       className="group inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 w-fit"
//     >
//       <span className="transition-transform duration-300 group-hover:-translate-x-1">
//         ←
//       </span>
//       <span className="font-medium">
//         Quay lại
//       </span>
//     </button>
//   </div>

//   {/* 🔥 BOTTOM CONTENT */}
//   <div className="max-w-3xl">

//     <span className="inline-block bg-orange-500/90 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
//       {blog.category}
//     </span>

//     <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
//       {blog.title}
//     </h1>

//     {blog.description && (
//       <p className="text-sm md:text-lg text-gray-200 max-w-2xl line-clamp-2">
//         {blog.description}
//       </p>
//     )}

//   </div>
// </div>
//       </div>

//       {/* 🔥 CONTENT */}
//       <div className="max-w-3xl mx-auto px-6 py-16">

//         <p className="text-lg text-gray-600 mb-8 leading-relaxed">
//           {blog.description}
//         </p>

//         {/* CONTENT HTML */}
//         <div
//           className="prose prose-lg max-w-none"
//           dangerouslySetInnerHTML={{ __html: blog.content }}
//         />
//       </div>

//       {/* 🔥 RELATED POSTS */}
//       {related.length > 0 && (
//         <div className="bg-gray-50 py-16">
//           <div className="max-w-6xl mx-auto px-6">

//             <h2 className="text-2xl font-bold mb-10">
//               Bài viết liên quan
//             </h2>

//             <div className="grid md:grid-cols-3 gap-8">
//               {related.map((item) => (
//                 <div
//                   key={item.blogId}
//                   onClick={() => navigate(`/blog/${item.blogId}`)}
//                   className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl transition"
//                 >
//                   <img
//                     src={item.image}
//                     className="h-48 w-full object-cover rounded-t-2xl"
//                   />

//                   <div className="p-5">
//                     <p className="text-xs text-orange-500 mb-2 uppercase">
//                       {item.category}
//                     </p>

//                     <h3 className="font-bold line-clamp-2">
//                       {item.title}
//                     </h3>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Load blog detail (đã tự filter IsPublished từ BE)
    fetch(`http://localhost:5000/api/blog/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setBlog(data);

        // 🔥 Load related (API mới)
        fetch("http://localhost:5000/api/blog")
          .then((res) => res.json())
          .then((all) => {
            const safeData = Array.isArray(all) ? all : [];

            const currentCategory =
              data.category || data.Category;

            const relatedBlogs = safeData
              .filter(
                (b) =>
                  b.blogId !== data.blogId &&
                  (b.category || b.Category) === currentCategory
              )
              .slice(0, 3);

            setRelated(relatedBlogs);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!blog) {
    return <div className="p-10 text-center">Không tìm thấy bài viết</div>;
  }

  return (
    <div className="bg-[#f5f0e8] min-h-screen">

      {/* 🔥 HERO */}
      <div className="relative h-[500px]">
        <img
          src={blog.image}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-between p-6 md:p-10 text-white">

          {/* 🔥 BACK BUTTON */}
          <div>
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="group inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              <span className="font-medium">
                Quay lại
              </span>
            </button>
          </div>

          {/* 🔥 CONTENT */}
          <div className="max-w-3xl">

            <span className="inline-block bg-orange-500/90 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
              {blog.category || blog.Category}
            </span>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
              {blog.title}
            </h1>

            {blog.description && (
              <p className="text-sm md:text-lg text-gray-200 max-w-2xl line-clamp-2">
                {blog.description}
              </p>
            )}

          </div>
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {blog.description}
        </p>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* 🔥 RELATED */}
      {related.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-6">

            <h2 className="text-2xl font-bold mb-10">
              Bài viết liên quan
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {related.map((item) => (
                <div
                  key={item.blogId}
                  onClick={() => navigate(`/blog/${item.blogId}`)}
                  className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl transition"
                >
                  <img
                    src={item.image}
                    className="h-48 w-full object-cover rounded-t-2xl"
                  />

                  <div className="p-5">
                    <p className="text-xs text-orange-500 mb-2 uppercase">
                      {item.category || item.Category}
                    </p>

                    <h3 className="font-bold line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
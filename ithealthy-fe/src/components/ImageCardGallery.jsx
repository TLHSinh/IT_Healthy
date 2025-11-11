import React from "react";
import { useNavigate } from "react-router-dom";
import "./ImageCardGallery.css";

export default function ImageCardGallery() {
  const navigate = useNavigate();

  const images = [
    {
      src: "/img/pic1.webp",
      title: "Bước 1",
      text: "Đạm",
    },
    {
      src: "/img/pic2.webp",
      title: "Bước 2",
      text: "Thực vật",
    },
    {
      src: "/img/pic3.webp",
      title: "Buớc 3",
      text: "Ăn kèm",
    },
    {
      src: "/img/pic4.webp",
      title: "Bước 4",
      text: "Xốt",
    },
  ];

  return (
      <div className="image-card-gallery">
        {images.map((item, index) => (
          <div key={index} className="image-card">
            <img src={item.src} alt={item.title} className="card-img" />
            <div className="card-overlay">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
  );
}

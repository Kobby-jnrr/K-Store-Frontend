import React, { useState, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./FloatingWhatsApp.css";

function FloatingWhatsApp() {
  const whatsappNumber = "233204465537";
  const message = "Hi! 👋 I have a question about K-Store.";

  const iconRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e) => {
    setDragging(true);
    iconRef.current.startX = e.clientX - position.x;
    iconRef.current.startY = e.clientY - position.y;
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - iconRef.current.startX,
      y: e.clientY - iconRef.current.startY,
    });
  };

  const handleMouseUp = () => setDragging(false);

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div
      ref={iconRef}
      className="floating-whatsapp"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="help-bubble"
      >
        💬 Need help or have suggestions?
      </a>

      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <FaWhatsapp className="whatsapp-icon" />
      </a>
    </div>
  );
}

export default FloatingWhatsApp;

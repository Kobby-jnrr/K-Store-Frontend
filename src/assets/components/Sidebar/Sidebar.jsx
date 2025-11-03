import React, { useState } from "react";
import "./Sidebar.css";

function Sidebar({ user }) {
  const [open, setOpen] = useState(false);

  if (user?.role === "admin") return null;

  const categories = [
    { id: "food", label: "Food", emoji: "🍔" },
    { id: "fashion", label: "Fashion", emoji: "👗" },
    { id: "electronics", label: "Electronics", emoji: "📱" },
    { id: "home", label: "Home", emoji: "🏠" },
    { id: "grocery", label: "Grocery", emoji: "🛒" },
    { id: "baby", label: "Baby", emoji: "👶" },
    { id: "beauty", label: "Beauty", emoji: "💄" },
    { id: "sports", label: "Sports", emoji: "🏀" },
    { id: "gaming", label: "Gaming", emoji: "🎮" },
    { id: "books", label: "Books", emoji: "📚" },
    { id: "toys", label: "Toys", emoji: "🧸" },
    { id: "automotive", label: "Automotive", emoji: "🚗" },
    { id: "jewelry", label: "Jewelry", emoji: "💍" },
    { id: "office", label: "Office", emoji: "🖇️" },
    { id: "pet", label: "Pet", emoji: "🐶" },
    { id: "tools", label: "Tools", emoji: "🛠️" },
    { id: "music", label: "Music", emoji: "🎵" },
    { id: "health", label: "Health", emoji: "💊" },
    { id: "outdoors", label: "Outdoors", emoji: "🌲" },
    { id: "kitchen", label: "Kitchen", emoji: "🍳" },
    { id: "shoes", label: "Shoes", emoji: "👟" },
    { id: "accessories", label: "Accessories", emoji: "👜" },
    { id: "other", label: "Other", emoji: "❓" },
  ];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setOpen(false);
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="arrow">{open ? "←" : "→"}</span>
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="main-body">
          <div className="head-container">
            <div className="side-head">Categories</div>
          </div>

          {categories.map((cat) => (
            <div
              className="container"
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
            >
              <span className="emoji">{cat.emoji}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

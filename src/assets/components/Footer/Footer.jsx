import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import "./Footer.css";

function Footer() {
  const categories = [
    { id: "food", label: "Food", emoji: "🍔" },
    { id: "fashion", label: "Fashion", emoji: "👗" },
    { id: "electronics", label: "Electronics", emoji: "💻" },
    { id: "home", label: "Home", emoji: "🏠" },
    { id: "grocery", label: "Grocery", emoji: "🛒" },
    { id: "baby", label: "Baby", emoji: "🍼" },
    { id: "beauty", label: "Beauty", emoji: "💄" },
    { id: "sports", label: "Sports", emoji: "⚽" },
    { id: "gaming", label: "Gaming", emoji: "🎮" },
    { id: "books", label: "Books", emoji: "📚" },
    { id: "toys", label: "Toys", emoji: "🧸" },
    { id: "automotive", label: "Automotive", emoji: "🚗" },
    { id: "jewelry", label: "Jewelry", emoji: "💍" },
    { id: "office", label: "Office", emoji: "📎" },
    { id: "pet", label: "Pet", emoji: "🐶" },
    { id: "tools", label: "Tools", emoji: "🛠️" },
    { id: "music", label: "Music", emoji: "🎵" },
    { id: "health", label: "Health", emoji: "💊" },
    { id: "outdoors", label: "Outdoors", emoji: "🏕️" },
    { id: "kitchen", label: "Kitchen", emoji: "🍳" },
    { id: "shoes", label: "Shoes", emoji: "👟" },
    { id: "accessories", label: "Accessories", emoji: "👜" },
    { id: "other", label: "Other", emoji: "🔧" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-about">
          <h2 className="footer-logo">K-Store</h2>
          <p>
            K-Store is the ultimate campus shopping platform 🏫🛍️,
            designed to bring convenience ⚡, affordability 💰, and reliability ✅
            directly to your screen. Whether you’re looking for the latest fashion 👗👟,
            electronics 💻📱, or everyday supplies 📝🍎, K-Store connects students
            to trusted vendors 🤝. Shopping made effortless 😎, enjoyable 🎉, and safe 🛡️.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</li>
            <li>All Products</li>
            <li>Cart</li>
            <li>Profile</li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-categories">
          <h4>Popular Categories</h4>
          <div className="category-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="footer-category">
                <span>{cat.emoji}</span> {cat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Icons */}
      <div className="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
        <a href="https://wa.me/233204465537" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} K-Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

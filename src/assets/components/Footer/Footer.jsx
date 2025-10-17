import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
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

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -30;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const columns = 4;
  const chunkSize = Math.ceil(categories.length / columns);
  const categoryColumns = [];
  for (let i = 0; i < categories.length; i += chunkSize) {
    categoryColumns.push(categories.slice(i, i + chunkSize));
  }

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Quick Links */}
        <div className="footer-section quick-links">
          <h4>Quick Links</h4>
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</div>
          <div onClick={() => scrollToSection("allProducts")}>All Products</div>
          <div onClick={() => scrollToSection("cartPage")}>Cart</div>
          <div onClick={() => scrollToSection("userProfile")}>Profile</div>
        </div>

        {/* Categories */}
        <div className="footer-section categories">
          <div className="category-columns">
            {categoryColumns.map((col, idx) => (
              <div key={idx} className="category-column">
                {col.map(cat => (
                  <div
                    key={cat.id}
                    className="footer-category"
                    onClick={() => scrollToSection(cat.id)}
                  >
                    <span className="emoji">{cat.emoji}</span> {cat.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="footer-section support">
          <h4>Support</h4>
          <div>Contact Us</div>
          <div>FAQ</div>
          <div>Privacy Policy</div>
        </div>
      </div>

      {/* Social Media */}
      <div className="footer-social">
        <a href="https://facebook.com/yourlink" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="https://twitter.com/yourlink" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://instagram.com/yourlink" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        <a href="https://linkedin.com/yourlink" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} K-Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/allProducts">All Products</Link>
          <Link to="/cartPage">Cart</Link>
          <Link to="/userProfile">Profile</Link>
        </div>

        <div className="footer-section">
          <h4>Categories</h4>
          <Link to="#fashion">Fashion</Link>
          <Link to="#electronics">Electronics</Link>
          <Link to="#home-living">Home & Living</Link>
          <Link to="#grocery">Grocery</Link>
          <Link to="#baby">Baby & Kids</Link>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} K-Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

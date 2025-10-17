import React from "react";
import "./BannerProductList.css";

const BannerProductList = ({ products }) => {
  const handleClick = (productId) => {
    const el = document.getElementById(`product-${productId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const showCatchMessage = !products || products.length === 0;

  return (
    <div className="promo">
      {/* Sparkle particles */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className="particle"></div>
      ))}

      {/* Spinning fan-like element */}
      <div className="spinning-fan"></div>

      {showCatchMessage ? (
        <div className="catch-message">
          <h1>🎉 Welcome to K-Store! 🎉</h1>
          <p>Activate vendor promos in the admin panel to display products here.</p>
        </div>
      ) : (
        <div className="banner-products">
          <div className="product-list">
            {products.map((product) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => handleClick(product._id)}
                style={{ cursor: "pointer" }}
              >
                <img src={product.image} alt={product.title} className="product-img" />
                <p className="price">GH₵{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerProductList;

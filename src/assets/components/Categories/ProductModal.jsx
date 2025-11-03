import React from "react";
import "./ProductModal.css";

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  const isVerified = product.vendor?.verified ?? false;
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-content-wrapper">
          <div className="modal-image-section">
            {discount && <span className="discount-badge">-{discount}%</span>}
            <img
              src={product.image}
              alt={product.title}
              className="modal-image"
            />
          </div>

          <div className="modal-details-section">
            <h2 className="modal-title">{product.title}</h2>

            <p className="modal-price">
              {product.oldPrice && (
                <span className="old-price">GH₵{product.oldPrice}</span>
              )}
              GH₵{product.price}
            </p>

            <p className="modal-description">{product.description}</p>

            {product.vendor && (
              <p className="modal-vendor">
                Vendor:{" "}
                {product.vendor.businessName?.trim() ||
                  product.vendor.username ||
                  `${product.vendor.firstName || ""} ${
                    product.vendor.lastName || ""
                  }`.trim()}
                {isVerified && (
                  <img
                    src="/verify.png"
                    alt="Verified"
                    className="green-tick"
                  />
                )}
              </p>
            )}

            <p className="modal-location">
              Location: {product.location || "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ProductList from "../../components/Categories/ProductList";
import "./VendorProfile.css";

function VendorProfile({ cart, setCart }) {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASES = [
    "https://k-store-backend.onrender.com/api",
    "http://localhost:5000/api",
  ];

  // Utility functions from UserProfile
  const getInitials = (name) => {
    if (!name) return "";
    return name.trim().split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
  };

  const getAvatarColor = (name) => {
    const colors = ["#2563eb","#f97316","#16a34a","#eab308","#8b5cf6","#db2777"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    const fetchVendorProducts = async () => {
      setLoading(true);
      for (const base of API_BASES) {
        try {
          const res = await axios.get(`${base}/products`);
          if (res.data) {
            const vendorProducts = res.data.filter((p) => p.vendor?._id === vendorId);
            setProducts(vendorProducts);
            if (vendorProducts.length > 0) setVendor(vendorProducts[0].vendor);
          }
          break;
        } catch (err) {
          console.error("Error fetching vendor products:", err);
        }
      }
      setLoading(false);
    };

    fetchVendorProducts();
  }, [vendorId]);

  if (loading) return <p>Loading vendor profile...</p>;
  if (!vendor) return <p>Vendor not found.</p>;

  return (
    <div className="vendor-page">
      {/* Vendor Banner */}
      <div className="vendor-profile-banner profile-header">
        {!vendor.image ? (
          <div
            className="profile-avatar initials-avatar"
            style={{ backgroundColor: getAvatarColor(vendor.username || vendor.shopName) }}
          >
            {getInitials(vendor.username || vendor.shopName)}
          </div>
        ) : (
          <img
            src={vendor.image}
            alt={vendor.username || "Vendor"}
            className="profile-avatar"
          />
        )}

        <div className="vendor-profile-details">
          <h2>
            {vendor.shopName || vendor.username}{" "}
            {vendor.verified && <span className="green-tick">✅</span>}
          </h2>
          {vendor.bio && <p>{vendor.bio}</p>}
          {vendor.verified !== undefined && (
            <span className={`vendor-badge ${vendor.verified ? "verified" : "unverified"}`}>
              {vendor.verified ? "Verified Account" : "Unverified"}
            </span>
          )}
        </div>
      </div>

      {/* Vendor Products */}
      <section className="vendor-products">
        <h3>Products from this shop</h3>
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <ProductList cart={cart} setCart={setCart} products={products} showVendorHeader={false} />
        )}
      </section>

      <Link to="/">
        <button className="back-btn">Back to Home</button>
      </Link>
    </div>
  );
}

export default VendorProfile;

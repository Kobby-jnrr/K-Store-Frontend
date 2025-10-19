import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios.js";
import axios from "axios";
import "./ProductList.css";

function ProductList({
  category,
  searchQuery = "",
  priceRange = "",
  vendor = "",
  location: locationFilter = "",
  cart,
  setCart,
  products: externalProducts,
  showVendorHeader = false,
  fullCount = 0,
}) {
  const [products, setProducts] = useState(externalProducts || []);
  const [loading, setLoading] = useState(!externalProducts);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({}); // track which descriptions are expanded
  const navigate = useNavigate();

  // Fetch products if not provided externally
  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      const url = category ? `/products/${category}` : "/products";

      try {
        const res = await API.fallbackRequest("get", url);
        setProducts(res.data || []);
      } catch {
        try {
          const localRes = await axios.get(`http://localhost:5000/api${url}`);
          setProducts(localRes.data || []);
        } catch (err) {
          console.error(err);
          setError("Failed to load products. Please try again later.");
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, externalProducts]);

  // Cart helpers
  const addToCart = (product) =>
    setCart({ ...cart, [product._id]: { ...product, quantity: 1 } });

  const increase = (id) =>
    setCart({ ...cart, [id]: { ...cart[id], quantity: cart[id].quantity + 1 } });

  const decrease = (id) => {
    if (cart[id].quantity > 1) {
      setCart({ ...cart, [id]: { ...cart[id], quantity: cart[id].quantity - 1 } });
    } else {
      const newCart = { ...cart };
      delete newCart[id];
      setCart(newCart);
    }
  };

  const toggleDescription = (id) => {
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  // ----------------------
  // Client-side filtering
  // ----------------------
  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesPrice = priceRange
      ? priceRange === "200+"
        ? p.price >= 200
        : p.price >= parseInt(priceRange.split("-")[0]) &&
          p.price <= parseInt(priceRange.split("-")[1])
      : true;

    const matchesVendor = vendor
      ? p.vendor?.username === vendor || p.vendor?.businessName === vendor
      : true;

    const matchesLocation = locationFilter
      ? (p.location || "Unknown") === locationFilter
      : true;

    return matchesSearch && matchesPrice && matchesVendor && matchesLocation;
  });

  return (
    <div className="product-list-container">
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((item) => {
            const isExpanded = expanded[item._id];
            const shortDesc =
              item.description && item.description.length > 100
                ? item.description.substring(0, 100) + "…"
                : item.description;

            return (
              <div key={item._id} id={`product-${item._id}`} className="product-card">
                <img src={item.image} alt={item.title} className="product-img" />
                <h4>{item.title}</h4>
                <p className="price">GH₵{item.price}</p>

                {/* Description with toggle */}
                {item.description && (
                  <p className="description">
                    {isExpanded ? item.description : shortDesc}
                    {item.description.length > 100 && (
                      <span
                        className="read-more"
                        onClick={() => toggleDescription(item._id)}
                      >
                        {isExpanded ? " Read less" : " Read more"}
                      </span>
                    )}
                  </p>
                )}

                {/* Vendor Name */}
                {item.vendor && (
                  <p
                    className="vendor-name"
                    onClick={() => navigate(`/vendor/${item.vendor._id}`)}
                  >
                    Vendor:{" "}
                    {item.vendor.businessName?.trim() ||
                      item.vendor.username ||
                      `${item.vendor.firstName || ""} ${item.vendor.lastName || ""}`.trim()}
                  </p>
                )}

                {!cart[item._id] ? (
                  <button className="add-btn" onClick={() => addToCart(item)}>Add to Cart</button>
                ) : (
                  <div className="counter">
                    <button onClick={() => decrease(item._id)}>-</button>
                    <span>{cart[item._id].quantity}</span>
                    <button onClick={() => increase(item._id)}>+</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showVendorHeader && fullCount > filteredProducts.length && (
        <div className="view-more">
          +{fullCount - filteredProducts.length} more
        </div>
      )}
    </div>
  );
}

export default ProductList;

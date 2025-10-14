import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios.js";
import axios from "axios";
import "./ProductList.css";

function ProductList({ category, cart, setCart, products: externalProducts, showVendorHeader = false, fullCount = 0 }) {
  const [products, setProducts] = useState(externalProducts || []);
  const [loading, setLoading] = useState(!externalProducts);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  const previewProducts = products;

  return (
    <div className="product-list-container">
      <div className="product-list">
        {previewProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          previewProducts.map((item) => (
            <div key={item._id} className="product-card">
              <img src={item.image} alt={item.title} className="product-img" />
              <h4>{item.title}</h4>
              <p className="price">GH₵{item.price}</p>
              
              {/* Vendor Name */}
              {item.vendor && (
                <p
                  className="vendor-name"
                  onClick={() => navigate(`/vendor/${item.vendor._id}`)}
                >
                  Vendor: {item.vendor.shopName || item.vendor.username}
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
          ))
        )}
      </div>
      {showVendorHeader && fullCount > previewProducts.length && (
        <div className="view-more">
          +{fullCount - previewProducts.length} more
        </div>
      )}
    </div>
  );
}

export default ProductList;

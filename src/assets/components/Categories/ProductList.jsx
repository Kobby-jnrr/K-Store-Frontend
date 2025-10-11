import React, { useState, useEffect } from "react";
import API from "../../../api/axios.js";
import axios from "axios";
import "./ProductList.css";

function ProductList({ category, cart, setCart, searchQuery, priceRange }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      const url = category ? `/products/${category}` : "/products";

      try {
        const res = await API.fallbackRequest("get", url);
        setProducts(res.data);
      } catch {
        try {
          const localRes = await axios.get(`http://localhost:5000/api${url}`);
          setProducts(localRes.data);
        } catch (err) {
          console.error(err);
          setError("Failed to load products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priceRange) {
      filtered = filtered.filter((p) => {
        const price = Number(p.price);
        if (priceRange === "0-50") return price >= 0 && price <= 50;
        if (priceRange === "50-100") return price > 50 && price <= 100;
        if (priceRange === "100-200") return price > 100 && price <= 200;
        if (priceRange === "200+") return price > 200;
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, priceRange]);

  // Cart management
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

  return (
    <div className="product-list">
      {filteredProducts.length === 0 && <p>No products found.</p>}

      {filteredProducts.map((item) => (
        <div key={item._id} className="product-card">
          <img src={item.image} alt={item.title} className="product-img" />
          <h4>{item.title}</h4>
          <p className="price">GH₵{item.price}</p>
          {item.vendor && (
            <p className="vendor-name">
              Vendor: {item.vendor.username}
            </p>
          )}
          {!cart[item._id] ? (
            <button className="add-btn" onClick={() => addToCart(item)}>
              Add to Cart
            </button>
          ) : (
            <div className="counter">
              <button onClick={() => decrease(item._id)}>-</button>
              <span>{cart[item._id].quantity}</span>
              <button onClick={() => increase(item._id)}>+</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProductList;

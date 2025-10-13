import React, { useState, useEffect } from "react";
import ProductList from "../../components/Categories/ProductList";
import "./Main-body.css";
import { Link } from "react-router-dom";
import axios from "axios";

function Main({ cart, setCart }) {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const categories = [
    "fashion", "electronics", "home", "grocery", "baby", "beauty", "sports",
    "gaming", "books", "toys", "automotive", "jewelry", "office", "pet",
    "tools", "music", "health", "outdoors", "kitchen", "shoes", "accessories", "other",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const newProductsByCategory = {};

      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await axios.get(
              `https://k-store-backend.onrender.com/api/products/${cat}`
            );
            if (res.data && res.data.length > 0) {
              newProductsByCategory[cat] = res.data;
            }
          } catch (err) {
            console.error(`Failed to fetch ${cat}`, err);
          }
        })
      );

      setProductsByCategory(newProductsByCategory);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <main className="main">
      <div className="promo">
        🎉 Black Friday Mega Sale!! 🎉
        <span>Grab your deal now!!!!!!</span>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Loading products...</p>
        </div>
      ) : (
        <>
          {categories.map(
            (cat) =>
              productsByCategory[cat] && (
                <section key={cat} id={cat}>
                  <h2>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                  </h2>
                  <ProductList category={cat} cart={cart} setCart={setCart} />
                </section>
              )
          )}
        </>
      )}

      <Link to="/cartPage">
        <button className="go-cart">GO TO CART</button>
      </Link>
    </main>
  );
}

export default Main;

import React, { useState, useEffect } from "react";
import ProductList from "../components/Categories/ProductList";
import "./AllProducts.css";
import { useLocation } from "react-router-dom";

function AllProducts({ cart, setCart }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location.search]);

  const handlePriceChange = (e) => setPriceRange(e.target.value);

  return (
    <main className="main">
      <h1>All Products</h1>

      {/* Price Filter */}
      <div className="filters">
        <label htmlFor="priceFilter">Filter by Price (GH₵): </label>
        <select id="priceFilter" value={priceRange} onChange={handlePriceChange}>
          <option value="">All</option>
          <option value="0-50">GH₵0 - GH₵50</option>
          <option value="50-100">GH₵50 - GH₵100</option>
          <option value="100-200">GH₵100 - GH₵200</option>
          <option value="200+">GH₵200+</option>
        </select>
      </div>

      {/* All Products */}
      <ProductList
        category="" // empty to fetch all products
        cart={cart}
        setCart={setCart}
        searchQuery={searchQuery}
        priceRange={priceRange}
      />
    </main>
  );
}

export default AllProducts;

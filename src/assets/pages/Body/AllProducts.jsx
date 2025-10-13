import React, { useState, useEffect } from "react";
import ProductList from "../../components/Categories/ProductList";
import "./AllProducts.css";
import { useLocation } from "react-router-dom";
import axios from "axios";

function AllProducts({ cart, setCart }) {
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);

  const categories = [
    "fashion","electronics","home","grocery","baby","beauty","sports","gaming",
    "books","toys","automotive","jewelry","office","pet","tools","music","health",
    "outdoors","kitchen","shoes","accessories","other",
  ];

  // Get filters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
    setCategory(params.get("category") || "");
    setVendor(params.get("vendor") || "");
    setLocationFilter(params.get("location") || "");
    setPriceRange(params.get("price") || "");
  }, [location.search]);

  // Fetch all products to get dynamic vendors and locations
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://k-store-backend.onrender.com/api/products");
        const uniqueVendors = [...new Set(res.data.map(p => p.vendor?.username).filter(Boolean))];
        const uniqueLocations = [...new Set(res.data.map(p => p.location || "Unknown"))];
        setVendors(uniqueVendors);
        setLocations(uniqueLocations);
      } catch (err) {
        console.error("Failed to fetch products for filters", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="main">
      <h1 className="h1head">All Products</h1>

      {/* Filters */}
      <div className="filters">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>

        {/* Vendor */}
        <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Location */}
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {/* Price */}
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">All Prices</option>
          <option value="0-50">GH₵0 - GH₵50</option>
          <option value="50-100">GH₵50 - GH₵100</option>
          <option value="100-200">GH₵100 - GH₵200</option>
          <option value="200+">GH₵200+</option>
        </select>
      </div>

      {/* Products */}
      <ProductList
        category={category}
        vendor={vendor}
        location={locationFilter}
        cart={cart}
        setCart={setCart}
        searchQuery={searchQuery}
        priceRange={priceRange}
      />
    </main>
  );
}

export default AllProducts;

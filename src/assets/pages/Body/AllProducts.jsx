import React, { useState, useEffect } from "react";
import ProductList from "../../components/Categories/ProductList";
import "./AllProducts.css";
import { useLocation } from "react-router-dom";
import schoolLocations from "../schoolLocations";
import axios from "axios";

function AllProducts({ cart, setCart }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const schools = [
    "University of Cape Coast",
    "University of Ghana",
    "Kwame Nkrumah University Of Science and Technology",
    "University of Education, Winneba",
    "University Of Professional Studies, Accra",
  ];

  const categories = [
    "fashion",
    "electronics",
    "home",
    "accessories",
    "grocery",
    "shoes",
    "beauty",
    "sports",
    "gaming",
    "books",
    "toys",
    "automotive",
    "jewelry",
    "office",
    "tools",
    "music",
    "health",
    "outdoors",
    "kitchen",
    "baby",
    "pet",
    "other",
  ];

  // Get filters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
    setCategory(params.get("category") || "");
    setVendor(params.get("vendor") || "");
    setLocationFilter(params.get("location") || "");
    const price = params.get("price");
    if (price) {
      const [min, max] = price.split("-");
      setMinPrice(min || "");
      setMaxPrice(max || "");
    } else {
      setMinPrice("");
      setMaxPrice("");
    }
  }, [location.search]);

  // Fetch all products to populate dynamic vendors and locations
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "https://k-store-backend.onrender.com/api/products"
        );
        const uniqueVendors = [
          ...new Set(res.data.map((p) => p.vendor?.username).filter(Boolean)),
        ];
        const uniqueLocations = [
          ...new Set(res.data.map((p) => p.vendor?.location || "Unknown")),
        ];
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
      <div className="allFilters">
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
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Vendor */}
        <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        {/* School */}
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Location */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {(() => {
            // Determine which locations to show
            let filteredLocations = [];

            if (schoolFilter) {
              // Specific school selected → show only its locations
              filteredLocations = schoolLocations[schoolFilter] || [];
            } else {
              // All schools → merge all locations
              filteredLocations = Object.values(schoolLocations).flat();
            }

            // Make sure locations are unique
            filteredLocations = [...new Set(filteredLocations)];

            return filteredLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ));
          })()}
        </select>

        {/* Price Range */}
        <div className="price-filter">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Products */}
      <ProductList
        category={category}
        vendor={vendor}
        school={schoolFilter}
        location={locationFilter}
        cart={cart}
        setCart={setCart}
        searchQuery={searchQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </main>
  );
}

export default AllProducts;

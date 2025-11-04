import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../../api/axios.js";
import ProductList from "../../components/Categories/ProductList";
import BannerProductList from "../../components/Categories/BannerProductList";
import FloatingWhatsApp from "./FloatingWhatsApp";
import "./Main-body.css";

function Main({ cart, setCart }) {
  const [allProducts, setAllProducts] = useState([]); // All products fetched once
  const [productsByGroup, setProductsByGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("vendor");
  const [categories, setCategories] = useState([]);
  const [groupFullCount, setGroupFullCount] = useState({});
  const [promoProducts, setPromoProducts] = useState([]);

  const defaultCategories = [
    "food",
    "fashion",
    "electronics",
    "home",
    "grocery",
    "baby",
    "beauty",
    "sports",
    "gaming",
    "books",
    "toys",
    "automotive",
    "jewelry",
    "office",
    "pet",
    "tools",
    "music",
    "health",
    "outdoors",
    "kitchen",
    "shoes",
    "accessories",
    "other",
  ];

  // Shuffle categories once
  useEffect(() => {
    const stored = sessionStorage.getItem("shuffledCategories");
    if (stored) setCategories(JSON.parse(stored));
    else {
      const shuffled = [...defaultCategories].sort(() => Math.random() - 0.5);
      setCategories(shuffled);
      sessionStorage.setItem("shuffledCategories", JSON.stringify(shuffled));
    }
  }, []);

  // Fetch promo products once
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await API.get("/promo");
        setPromoProducts(res.data?.products?.slice(0, 20) || []);
      } catch (err) {
        console.error("Error fetching promo:", err);
        setPromoProducts([]);
      }
    };
    fetchPromo();
  }, []);

  // Fetch all products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const res = await API.get("/products");
        setAllProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setAllProducts([]);
      }
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  // Organize products by vendor or category whenever viewType changes
  useEffect(() => {
    const newProducts = {};
    const fullCountObj = {};

    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

    if (viewType === "category") {
      categories.forEach((cat) => {
        const filtered = allProducts.filter((p) => p.category === cat);
        if (filtered.length) {
          newProducts[cat] = shuffleArray(filtered);
          fullCountObj[cat] = filtered.length;
        }
      });
    } else {
      const tempVendorMap = {};
      allProducts.forEach((prod) => {
        const vendorName =
          prod.vendorName || prod.vendor?.username || "Unknown Vendor";
        if (!tempVendorMap[vendorName]) tempVendorMap[vendorName] = [];
        tempVendorMap[vendorName].push({
          ...prod,
          vendorVerified: prod.vendor?.verified || false,
          vendorId: prod.vendor?._id || null,
        });
        fullCountObj[vendorName] = (fullCountObj[vendorName] || 0) + 1;
      });

      // Limit to 4 products per vendor for display
      Object.keys(tempVendorMap).forEach(
        (v) => (tempVendorMap[v] = shuffleArray(tempVendorMap[v]).slice(0, 8))
      );
      Object.assign(newProducts, tempVendorMap);
    }

    setProductsByGroup(newProducts);
    setGroupFullCount(fullCountObj);
  }, [viewType, allProducts, categories]);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  return (
    <main className="main">
      <div className="view-toggle-tabs">
        <button
          className={`tab-btn ${viewType === "vendor" ? "active" : ""}`}
          onClick={() => setViewType("vendor")}
        >
          By Vendor
        </button>
        <button
          className={`tab-btn ${viewType === "category" ? "active" : ""}`}
          onClick={() => setViewType("category")}
        >
          By Category
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <h3 className="loading-text">Loading products...</h3>
        </div>
      ) : Object.keys(productsByGroup).length ? (
        Object.keys(productsByGroup).map((group) => (
          <section key={group} id={group}>
            <div className="banner-wrapper">
              <BannerProductList
                products={promoProducts.length > 0 ? promoProducts : []}
              />
            </div>

            {viewType === "category" && <h2>{group.toUpperCase()}</h2>}

            {viewType === "vendor" && productsByGroup[group][0] && (
              <div className="vendor-banner">
                <div className="vendor-initials">{getInitials(group)}</div>
                <div className="vendor-banner-details">
                  <h3>{group}</h3>
                  <Link to={`/vendor/${productsByGroup[group][0].vendorId}`}>
                    <button className="view-shop-btn">View Shop</button>
                  </Link>
                </div>
              </div>
            )}

            <ProductList
              category={group}
              cart={cart}
              setCart={setCart}
              products={productsByGroup[group]}
              showVendorHeader={viewType === "vendor"}
              fullCount={groupFullCount[group]}
            />
          </section>
        ))
      ) : (
        <div className="no-products">
          <p>No products available.</p>
        </div>
      )}

      <Link to="/cartPage">
        <button className="go-cart">GO TO CART</button>
      </Link>
      <FloatingWhatsApp />
    </main>
  );
}

export default Main;

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductList from "../../components/Categories/ProductList";
import "./Main-body.css";

function Main({ cart, setCart }) {
  const [productsByGroup, setProductsByGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("category");
  const [categories, setCategories] = useState([]);
  const [groupFullCount, setGroupFullCount] = useState({});
  const [activePromoVendors, setActivePromoVendors] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  const defaultCategories = [
    "fashion","electronics","home","grocery","baby","beauty","sports",
    "gaming","books","toys","automotive","jewelry","office","pet",
    "tools","music","health","outdoors","kitchen","shoes","accessories","other"
  ];

  const API_BASES = [
    "https://k-store-backend.onrender.com/api",
    "http://localhost:5000/api",
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

  // Fetch promo vendors (can be called manually)
  const fetchPromo = useCallback(async () => {
    for (const base of API_BASES) {
      try {
        const res = await axios.get(`${base}/promo`);
        const vendorIds = res.data.vendorIds || [];
        setActivePromoVendors(vendorIds);

        if (vendorIds.length) {
          const allProducts = [];
          for (const vendorId of vendorIds) {
            try {
              const prodRes = await axios.get(`${base}/products/vendor/${vendorId}`);
              if (prodRes.data?.length) allProducts.push(...prodRes.data);
            } catch {}
          }
          const shuffled = allProducts.sort(() => Math.random() - 0.5).slice(0, 12);
          setPromoProducts(shuffled);
        } else {
          setPromoProducts([]);
        }
        break;
      } catch(err) {
        console.error("Error fetching vendor products:", vendorId, err);
      }

    }
  }, []);

  // Fetch promo on mount
  useEffect(() => {
    fetchPromo();
  }, [fetchPromo]);

  // Fetch products grouped by category or vendor
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const newProducts = {};
      const fullCountObj = {};

      if (viewType === "category") {
        await Promise.all(categories.map(async cat => {
          for (const base of API_BASES) {
            try {
              const res = await axios.get(`${base}/products/${cat}`);
              if (res.data?.length) {
                newProducts[cat] = res.data;
                break;
              }
            } catch {}
          }
        }));
      } else {
        const tempVendorMap = {};
        for (const base of API_BASES) {
          try {
            const res = await axios.get(`${base}/products`);
            if (res.data?.length) {
              res.data.forEach(prod => {
                const vendorName = prod.vendorName || prod.vendor?.username || "Unknown Vendor";
                if (!tempVendorMap[vendorName]) tempVendorMap[vendorName] = [];
                tempVendorMap[vendorName].push({
                  ...prod,
                  vendorVerified: prod.vendor?.verified || false,
                  vendorId: prod.vendor?._id || null
                });
                fullCountObj[vendorName] = (fullCountObj[vendorName] || 0) + 1;
              });
              Object.keys(tempVendorMap).forEach(v => {
                tempVendorMap[v] = tempVendorMap[v].slice(0, 4);
              });
              Object.assign(newProducts, tempVendorMap);
              break;
            }
          } catch {}
        }
      }

      setProductsByGroup(newProducts);
      setGroupFullCount(fullCountObj);
      setLoading(false);
    };

    fetchProducts();
  }, [viewType, categories]);

  const getInitials = name =>
    name.split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0, 2);

  return (
    <main className="main">
      <div className="view-toggle-tabs">
        <button
          className={`tab-btn ${viewType === "category" ? "active" : ""}`}
          onClick={() => setViewType("category")}
        >
          By Category
        </button>
        <button
          className={`tab-btn ${viewType === "vendor" ? "active" : ""}`}
          onClick={() => setViewType("vendor")}
        >
          By Vendor
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <h3 className="loading-text">Loading products...</h3>
        </div>
      ) : Object.keys(productsByGroup).length ? (
        Object.keys(productsByGroup).map(group => (
          <section key={group} id={group}>
            <div className="promo">
              {promoProducts.length ? (
                <div className="promo-products">
                  <ProductList
                  products={promoProducts}
                  cart={cart}
                  setCart={setCart}
                  />
                </div>
                ) : (
                <>
                🎉 Special Promo Available! 🎉
                <span>Activate promo in admin to display vendor products here.</span>
                </>
              )}
            </div>
            {/* Category / Vendor Title */}
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

            {/* Product List */}
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
        <div className="no-products"><p>No products available.</p></div>
      )}

      <Link to="/cartPage">
        <button className="go-cart">GO TO CART</button>
      </Link>
    </main>
  );
}

export default Main;

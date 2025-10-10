import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation,} from "react-router-dom";
import Header from "./assets/components/Header/Header.jsx";
import Sidebar from "./assets/components/Sidebar/Sidebar.jsx";
import Footer from "./assets/components/Footer/Footer.jsx";
import Main from "./assets/pages/Main-body.jsx";
import LoginPage from "./assets/pages/Login.jsx";
import SignUp from "./assets/pages/Signup.jsx";
import CartPage from "./assets/pages/CartPage.jsx";
import UserProfile from "./assets/pages/UserProfile.jsx";
import VendorAddProduct from "./assets/pages/AddProduct.jsx";
import AllProducts from "./assets/pages/AllProducts.jsx";
import CheckoutPage from "./assets/pages/CheckoutPage.jsx";
import AdminLayout from "./assets/pages/admin/AdminLayout.jsx";
import VendorOrders from "./assets/pages/VendorOrders.jsx";
import "./K-Store.css";

/* ------------------------- APP LAYOUT FOR USERS/VENDORS ------------------------- */
function AppLayout({ cart, setCart, totalItems, logout, user }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Header totalItems={totalItems} logout={logout} user={user} />

      {/* Sidebar only on Main page */}
      {location.pathname === "/" && <Sidebar />}

      <Routes>
        <Route path="/" element={<Main cart={cart} setCart={setCart} />} />
        <Route path="/cartPage" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/allProducts" element={<AllProducts cart={cart} setCart={setCart} />} />
        <Route path="/addProduct" element={<VendorAddProduct />} />
        <Route path="/userProfile" element={<UserProfile user={user} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
        <Route path="/vendor-orders" element={<VendorOrders />} />
        {/* Catch-all redirects to main */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

/* ------------------------- MAIN STORE COMPONENT ------------------------- */
function Store() {
  // Load user safely from sessionStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Logout clears session and cart
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setCart({});
    localStorage.removeItem("cart");
  };

  // Persist cart updates
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            user?.role === "admin" ? <AdminLayout user={user} /> : <Navigate to="/login" replace />
          }
        />

        {/* Authenticated user/vendor routes */}
        <Route
          path="/*"
          element={
            user ? (
              user.role === "admin" ? (
                // Admin auto-redirect to dashboard
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AppLayout
                  cart={cart}
                  setCart={setCart}
                  totalItems={totalItems}
                  logout={logout}
                  user={user}
                />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default Store;

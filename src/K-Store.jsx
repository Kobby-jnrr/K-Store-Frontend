import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./assets/components/Header/Header.jsx";
import Sidebar from "./assets/components/Sidebar/Sidebar.jsx";
import Main from "./assets/pages/Main-body.jsx";
import Footer from "./assets/components/Footer/Footer.jsx";
import LoginPage from "./assets/pages/Login.jsx";
import SignUp from "./assets/pages/Signup.jsx";
import CartPage from "./assets/pages/CartPage.jsx";
import UserProfile from "./assets/pages/UserProfile.jsx";
import VendorAddProduct from "./assets/pages/AddProduct.jsx";
import AllProducts from "./assets/pages/AllProducts.jsx";
import AdminLayout from "./assets/pages/admin/AdminLayout.jsx";
import CheckoutPage from "./assets/pages/CheckoutPage.jsx";
import "./K-Store.css";

/* ------------------------- APP LAYOUT FOR USERS/VENDORS ------------------------- */
function AppLayout({ cart, setCart, totalItems, logout, user }) {
  const location = useLocation();

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="app-layout">
      <Header totalItems={totalItems} logout={logout} user={user} />
      <div className="content">
        {location.pathname !== "/cartPage" && location.pathname !== "/checkout" && <Sidebar />}
        <Routes>
          <Route path="/" element={<Main cart={cart} setCart={setCart} />} />
          <Route path="/cartPage" element={<CartPage cart={cart} setCart={setCart} />} />
          <Route path="/allProducts" element={<AllProducts cart={cart} setCart={setCart} />} />
          <Route path="/addProduct" element={<VendorAddProduct />} />
          <Route path="/userProfile" element={<UserProfile user={user} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

/* ------------------------- MAIN STORE COMPONENT ------------------------- */
function Store() {
  // Load user and cart from sessionStorage / localStorage
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setCart({});
    localStorage.removeItem("cart");
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return;

    let logoutTimer = setTimeout(() => {
      alert("Session expired. You have been logged out.");
      logout();
    }, 30 * 60 * 1000); // 30 minutes

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        alert("Session expired. You have been logged out.");
        logout();
      }, 30 * 60 * 1000);
    };

    window.addEventListener("click", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={user?.role === "admin" ? <AdminLayout user={user} /> : <Navigate to="/login" replace />}
        />

        {/* Regular user/vendor routes */}
        <Route
          path="/*"
          element={
            user ? (
              <AppLayout cart={cart} setCart={setCart} totalItems={totalItems} logout={logout} user={user} />
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

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import "./K-Store.css";

const devMode = false;

function AppLayout({ cart, setCart, totalItems, logout, user }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* Header */}
      <Header totalItems={totalItems} logout={logout} user={user} />

      <div className="content">
        {/* Sidebar only on certain pages */}
        {location.pathname !== "/cartPage" && <Sidebar />}

        {/* Main routes */}
        <Routes>
          <Route path="/" element={<Main cart={cart} setCart={setCart} />} />
          <Route path="/cartPage" element={<CartPage cart={cart} setCart={setCart} />} />
          <Route path="/allProducts" element={<AllProducts cart={cart} setCart={setCart} />} />
          <Route path="/addProduct" element={<VendorAddProduct />} />
          <Route path="/userProfile" element={<UserProfile user={user} />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Store() {
  // ✅ Load user from localStorage to persist login
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [cart, setCart] = useState({});

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Count total items in cart
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            devMode || user ? (
              <AppLayout
                cart={cart}
                setCart={setCart}
                totalItems={totalItems}
                logout={logout}
                user={user}
              />
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

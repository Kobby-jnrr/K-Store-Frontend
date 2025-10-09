// Store.jsx
import React, { useState, useEffect } from "react";
import { Navigate, BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

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

import "./K-Store.css";

const devMode = false;

/* ------------------------- APP LAYOUT (for users/vendors) ------------------------- */
function AppLayout({ cart, setCart, totalItems, logout, user }) {
  const location = useLocation();

  // Optional: Redirect admin from user layout (better than window.location.replace)
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="app-layout">
      <Header totalItems={totalItems} logout={logout} user={user} />

      <div className="content">
        {location.pathname !== "/cartPage" && <Sidebar />}

        <Routes>
          <Route path="/" element={<Main cart={cart} setCart={setCart} />} />
          <Route path="/cartPage" element={<CartPage cart={cart} setCart={setCart} />} />
          <Route path="/allProducts" element={<AllProducts cart={cart} setCart={setCart} />} />
          <Route path="/addProduct" element={<VendorAddProduct />} />
          <Route path="/userProfile" element={<UserProfile user={user} />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------- MAIN STORE COMPONENT ------------------------- */
function Store() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [cart, setCart] = useState({});
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

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

        {/* Regular user/vendor routes */}
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

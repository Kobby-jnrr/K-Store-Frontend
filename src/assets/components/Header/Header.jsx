import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import Search from "./head-image/Search.png";
import Cart from "./head-image/Cart.png";
import Profile from "./head-image/user.png";
import logo from "./head-image/Web-logo.png";
import exit from "./head-image/logout.png";
import allP from "./head-image/allProducts.png";
import filter from "./head-image/filter.png";
import Adder from "./head-image/Add.png";
import MyOrders from "./head-image/Orders.png";
import NotificationPopup from "./Notification/Notification.jsx";
import { useState, useRef, useEffect } from "react";

function Header({ totalItems, logout, user }) {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  const filterRef = useRef(null);

  const categories = [
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

  // Close filter if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleInputChange = (e) => setSearchInput(e.target.value);

  const applyFilters = (category = selectedCategory, price = selectedPrice) => {
    let query = `/allProducts?`;
    if (searchInput.trim() !== "") query += `search=${encodeURIComponent(searchInput)}&`;
    if (category) query += `category=${category}&`;
    if (price) query += `price=${price}&`;
    navigate(query.slice(0, -1));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch(e);
  };

  return (
    <header>
      {/* Left Logo */}
      <div className="left">
        <Link to="/">
          <img src={logo} className="logo" alt="Logo" />
        </Link>
      </div>

      {/* Middle: Filter + Search */}
      <div className="middle">
        <button className="filter-button" onClick={toggleFilter}>
          <img src={filter} className="filter" alt="Filter" />
        </button>

        <input
          type="text"
          className="search"
          placeholder="Search for products, categories or brands..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />

        <button className="search-button" onClick={handleSearch}>
          <img src={Search} className="search-icon" alt="Search" />
        </button>

        {showFilter && (
          <div className="filter-dropdown" ref={filterRef}>
            <h4>Filter Products</h4>

            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  applyFilters(e.target.value, selectedPrice);
                }}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price:</label>
              <select
                value={selectedPrice}
                onChange={(e) => {
                  setSelectedPrice(e.target.value);
                  applyFilters(selectedCategory, e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="0-500">₵0 - ₵500</option>
                <option value="500-1000">₵500 - ₵1000</option>
                <option value="1000-2000">₵1000 - ₵2000</option>
                <option value="2000+">₵2000+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="right">
        <Link to="/allProducts">
          <button className="allP-button">
            <img src={allP} className="allP" alt="All Products" />
          </button>
        </Link>

        {user?.role === "vendor" && (
          <>
            <Link to="/addProduct">
              <button className="cart-button">
                <img src={Adder} className="cart" alt="Add Product" />
              </button>
            </Link>
            <Link to="/vendor-orders">
              <button className="cart-button">
                <img src={MyOrders} className="cart" alt="My Orders" />
              </button>
            </Link>
          </>
        )}
        <Link to="/cartPage">
          <button className="cart-button">
            <img src={Cart} className="cart" alt="Cart" />
            <p id="cartCount">{totalItems}</p>
          </button>
        </Link>

        <Link to="/userProfile">
          <button className="profile-button">
            <img src={Profile} className="user-profile" alt="Profile" />
          </button>
        </Link>

        < NotificationPopup user={user}/>

        <button className="exit-button" onClick={logout}>
          <img src={exit} className="exit" alt="Logout" />
        </button>
      </div>
    </header>
  );
}

export default Header;

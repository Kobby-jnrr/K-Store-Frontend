import React from "react";
import { Link } from "react-router-dom";
import ProductList from "../../components/Categories/ProductList";
import "./Main-body.css";

function Main({ cart, setCart, searchQuery, priceRange }) {
  const categories = [
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

  return (
    <main className="main">
      {/* Promo Banner */}
      <div className="promo">
        🎉 Black Friday Mega Sale!! 🎉
        <span>Grab your deal now!!!!!!</span>
        <div className="countdown" id="countdown"></div>
      </div>

      {/* Categories with products */}
      {categories.map((cat) => (
        <ProductList
          key={cat}
          category={cat}
          cart={cart}
          setCart={setCart}
          searchQuery={searchQuery}
          priceRange={priceRange}
          showCategoryTitle={true} // title only shows if products exist
        />
      ))}

      {/* Go to cart button */}
      <Link to="/cartPage">
        <button className="go-cart">GO TO CART</button>
      </Link>
    </main>
  );
}

export default Main;

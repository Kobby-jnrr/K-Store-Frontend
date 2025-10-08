import React, { useState } from "react";
import "./product-list.css";
import Header from "../Header/Header";

function ProductList() {
  const products = [
    {
    id: 1, 
    title: "Balance Canvas", 
    price: 299, 
    image: "/fashion/shoe1.jpg" 
    },
    { 
    id: 2, 
    title: "Polyester Dress", 
    price: 129, 
    image: "/fashion/dress2.jpg" 
    },
    { 
    id: 3, 
    title: "Itel City 100", 
    price: 599, 
    image: "/electronics/itel.jpg" 
    },
    { 
    id: 4, 
    title: "Nivea Body Lotion", 
    price: 9, 
    image: "/beauty/Nivea Body Lotion.jpg" 
    },
    { 
    id: 5, 
    title: "Sneakers", 
    price: 72.99, 
    image: "/fashion/shoe9.jpg" 
    },
  ];

  // cart state
  const [cart, setCart] = useState({});

  const totalItems = Object.values(cart).reduce((sum, quantity) =>  sum + quantity, 0);

  console.log(totalItems);


  // add to cart
  const addToCart = (id) => {
    setCart({ ...cart, [id]: 1 });
  };

  // increase
  const increase = (id) => {
    setCart({ ...cart, [id]: cart[id] + 1 });
  };

  // decrease
  const decrease = (id) => {
    if (cart[id] > 1) {
      setCart({ ...cart, [id]: cart[id] - 1 });
    } else {
      const newCart = { ...cart };
      delete newCart[id];
      setCart(newCart);
    }
  };

  return (
    <div className="product-list">
      {products.map((item) => (
        <div key={item.id} className="product">
          <img src={item.image} className="pp" alt={item.title} />
          <h4>{item.title}</h4>
          <p>${item.price}</p>

          {!cart[item.id] ? (
            <button className="add-btn" onClick={() => addToCart(item.id)}>
              Add to Cart
            </button>
          ) : (
            <div className="counter">
              <button onClick={() => decrease(item.id)}>-</button>
              <span>{cart[item.id]}</span>
              <button onClick={() => increase(item.id)}>+</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProductList
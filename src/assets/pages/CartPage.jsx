import { Link } from "react-router-dom";
import "./CartPage.css";

function CartPage({ cart, setCart }) {
  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (id) => {
    const updatedCart = { ...cart };
    delete updatedCart[id];
    setCart(updatedCart);
  };

  const increase = (id) => {
    setCart({
      ...cart,
      [id]: { ...cart[id], quantity: cart[id].quantity + 1 },
    });
  };

  const decrease = (id) => {
    if (cart[id].quantity > 1) {
      setCart({
        ...cart,
        [id]: { ...cart[id], quantity: cart[id].quantity - 1 },
      });
    } else {
      const updatedCart = { ...cart };
      delete updatedCart[id];
      setCart(updatedCart);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <p>Your cart is empty 😢</p>
        <Link to="/">
          <button className="shop-button">Continue Shopping</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-main">
        {/* --- Cart Items --- */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-row">
              <img src={item.image} alt={item.title} className="cart-image" />
              <div className="cart-info">
                <h3>{item.title}</h3>
                <p className="vendor">Vendor: {item.vendor.username}</p>
                <div className="quantity-controls">
                  <button onClick={() => decrease(item._id)}>-</button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => increase(item._id)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item._id)}>Remove</button>
              </div>
              <div className="cart-price">
                GH₵{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* --- Order Summary --- */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p>Subtotal: GH₵{subtotal.toFixed(2)}</p>
          <p>Delivery: GH₵20.00</p>
          <hr />
          <h3>Total: GH₵{(subtotal + 20).toFixed(2)}</h3>

          <Link to="/checkout">
            <button className="checkout-btn">Checkout</button>
          </Link>

          <Link to="/">
            <button className="order-continue-btn">Continue Shopping</button>
          </Link>

          {/* --- Promo / Discount Section --- */}
          <div className="promo-section">
            <h4>Have a promo code?</h4>
            <input type="text" placeholder="Enter code" />
            <button>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;

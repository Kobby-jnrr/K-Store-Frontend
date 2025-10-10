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
      const newCart = { ...cart };
      delete newCart[id];
      setCart(newCart);
    }
  };

  return (
    <div className="cart-container">
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty 😢</p>
          <Link to="/">
            <button className="shop-button">Continue Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-card">
                <img src={item.image} alt={item.title} className="cart-image" />
                <div className="cart-details">
                  <h3>{item.title}</h3>
                  <p>Vendor: {item.vendor.username}</p>
                  <div className="quantity-controls">
                    <button onClick={() => decrease(item._id)}>-</button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => increase(item._id)}>+</button>
                  </div>
                </div>
                <div className="cart-pricing">
                  <p>Price: GH₵{item.price.toFixed(2)}</p>
                  <p>Total: GH₵{(item.price * item.quantity).toFixed(2)}</p>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

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
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;

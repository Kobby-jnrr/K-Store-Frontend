import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cod"); // default COD
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [momoNumber, setMomoNumber] = useState("");

  const subtotal = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const confirmOrder = () => {
    // Validate payment info
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        alert("Please fill in all card details!");
        return;
      }
    } else if (paymentMethod === "momo") {
      if (!momoNumber) {
        alert("Please enter your Momo number!");
        return;
      }
    }

    // Simulate saving order
    const orderData = {
      items: Object.values(cart),
      total: subtotal + 20,
      paymentMethod,
      ...(paymentMethod === "card" ? { cardDetails } : {}),
      ...(paymentMethod === "momo" ? { momoNumber } : {}),
    };

    console.log("Order confirmed:", orderData);

    alert("Order confirmed! 🎉");
    setCart({}); // Clear cart
    navigate("/"); // Go home
  };

  return (
    <div className="checkout-container">
      {Object.values(cart).length === 0 ? (
        <div className="empty-checkout">
          <p>Your cart is empty 😢</p>
          <Link to="/">
            <button className="back-home-btn">Back to Store</button>
          </Link>
        </div>
      ) : (
        <div className="checkout-content">
          {/* Left: Cart Items */}
          <div className="checkout-items">
            {Object.values(cart).map((item) => (
              <div key={item._id} className="checkout-card">
                <img src={item.image} alt={item.title} className="checkout-image" />
                <div className="checkout-details">
                  <h3>{item.title}</h3>
                  <p>Vendor: {item.username || "N/A"}</p>
                  <p>Price: GH₵{item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: GH₵{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <p>Subtotal: GH₵{subtotal.toFixed(2)}</p>
            <p>Delivery: GH₵20.00</p>
            <hr />
            <h3>Total: GH₵{(subtotal + 20).toFixed(2)}</h3>

            {/* Payment Options */}
            <div className="payment-section">
              <h3>Payment Method</h3>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Card
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={() => setPaymentMethod("momo")}
                />
                Mobile Money
              </label>

              {/* Conditional Inputs */}
              {paymentMethod === "card" && (
                <div className="card-details">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Expiry (MM/YY)"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </div>
              )}

              {paymentMethod === "momo" && (
                <div className="momo-details">
                  <input
                    type="text"
                    placeholder="Mobile Money Number"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button className="confirm-btn" onClick={confirmOrder}>
              Confirm Order
            </button>
            <Link to="/">
              <button className="continue-btn">Continue Shopping</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;

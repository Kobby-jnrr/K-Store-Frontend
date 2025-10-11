import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [momoNumber, setMomoNumber] = useState("");
  const [orderModal, setOrderModal] = useState(false);

  const subtotal = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const confirmOrder = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (paymentMethod === "card" && (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv)) return;
    if (paymentMethod === "momo" && !momoNumber) return;

    const orderData = {
      items: Object.values(cart).map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor?._id || item.vendor,
      })),
      total: subtotal + 20,
      paymentMethod,
      ...(paymentMethod === "card" ? { cardDetails } : {}),
      ...(paymentMethod === "momo" ? { momoNumber } : {}),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order failed");

      setCart({});
      setOrderModal(true);
    } catch (err) {
      console.error("Order error:", err);
      setCart({});
      setOrderModal(true);
    }
  };

  const handleCloseModal = () => {
    setOrderModal(false);
    navigate("/"); // redirect to main page
  };

  return (
    <div className="checkout-container">
      {Object.values(cart).length === 0 ? (
        <div className="empty-checkout">
          <p>Your cart is empty 😢</p>
          <Link to="/"><button className="back-home-btn">Back to Store</button></Link>
        </div>
      ) : (
        <div className="checkout-content">
          <div className="checkout-items">
            {Object.values(cart).map((item) => (
              <div key={item._id} className="checkout-card">
                <img src={item.image} alt={item.title} className="checkout-image" />
                <div className="checkout-details">
                  <h3>{item.title}</h3>
                  <p className="vendor-info">Vendor: {item.vendor?.username || "N/A"}</p>
                  <p>Price: GH₵{item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: GH₵{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <p>Subtotal: GH₵{subtotal.toFixed(2)}</p>
            <p>Delivery: GH₵20.00</p>
            <hr />
            <h3>Total: GH₵{(subtotal + 20).toFixed(2)}</h3>

            <div className="payment-section">
              <h3>Payment Method</h3>
              <label><input type="radio" name="payment" value="cod" checked={paymentMethod==="cod"} onChange={()=>setPaymentMethod("cod")} /> Cash on Delivery</label>
              <label><input type="radio" name="payment" value="card" checked={paymentMethod==="card"} onChange={()=>setPaymentMethod("card")} /> Card</label>
              <label><input type="radio" name="payment" value="momo" checked={paymentMethod==="momo"} onChange={()=>setPaymentMethod("momo")} /> Mobile Money</label>

              {paymentMethod==="card" && (
                <div className="card-details">
                  <input placeholder="Card Number" value={cardDetails.cardNumber} onChange={(e)=>setCardDetails({...cardDetails, cardNumber:e.target.value})} />
                  <input placeholder="Expiry (MM/YY)" value={cardDetails.expiry} onChange={(e)=>setCardDetails({...cardDetails, expiry:e.target.value})} />
                  <input placeholder="CVV" value={cardDetails.cvv} onChange={(e)=>setCardDetails({...cardDetails, cvv:e.target.value})} />
                </div>
              )}

              {paymentMethod==="momo" && (
                <div className="momo-details">
                  <input placeholder="Mobile Money Number" value={momoNumber} onChange={(e)=>setMomoNumber(e.target.value)} />
                </div>
              )}
            </div>

            <button className="confirm-btn" onClick={confirmOrder}>Confirm Order</button>
            <Link to="/"><button className="continue-btn">Continue Shopping</button></Link>
          </div>
        </div>
      )}

      {orderModal && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <h2>✅ Order Placed!</h2>
            <p>Your order has been placed successfully. We will notify you once it is confirmed.</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;

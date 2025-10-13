import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [momoNumber, setMomoNumber] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(false);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = fulfillmentType === "delivery" ? 20 : 0;
  const total = subtotal + deliveryFee;

  const confirmOrder = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return navigate("/login");

    if (paymentMethod === "card" && (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv)) return;
    if (paymentMethod === "momo" && !momoNumber) return;

    setLoading(true);

    const orderData = {
      items: cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor?._id || item.vendor
      })),
      total,
      fulfillmentType,
      paymentMethod,
      ...(paymentMethod === "card" ? { cardDetails } : {}),
      ...(paymentMethod === "momo" ? { momoNumber } : {}),
    };

    try {
      const urls = [
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/orders`,
      ];

      for (let url of urls) {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order failed");
        break;
      }

      setCart({});
      setLoading(false);
      setOrderModal(true);

    } catch (err) {
      console.error("Order error:", err);
      setCart({});
      setLoading(false);
      setOrderModal(true);
    }
  };

  const handleCloseModal = () => {
    setOrderModal(false);
    navigate("/");
  };

  return (
    <div className="checkout-container">

      {cartItems.length === 0 ? (
        <div className="empty-checkout">
          <p>Your cart is empty 😢</p>
          <Link to="/"><button className="back-home-btn">Back to Store</button></Link>
        </div>
      ) : (
        <div className="checkout-content">
          
          {/* Cart Items */}
          <div className="checkout-items">
            {cartItems.map(item => (
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

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <p>Subtotal: GH₵{subtotal.toFixed(2)}</p>
            {fulfillmentType === "delivery" && <p>Delivery: GH₵{deliveryFee.toFixed(2)}</p>}
            <hr />
            <h3>Total: GH₵{total.toFixed(2)}</h3>

            <div className="payment-section">
              <h4>Order Type</h4>
              <label><input type="radio" value="pickup" checked={fulfillmentType==="pickup"} onChange={()=>setFulfillmentType("pickup")} /> Pick-up</label>
              <label><input type="radio" value="delivery" checked={fulfillmentType==="delivery"} onChange={()=>setFulfillmentType("delivery")} /> Delivery</label>

              <h4>Payment Method</h4>
              <label><input type="radio" value="cod" checked={paymentMethod==="cod"} onChange={()=>setPaymentMethod("cod")} /> Cash on Delivery</label>
              <label><input type="radio" value="card" checked={paymentMethod==="card"} onChange={()=>setPaymentMethod("card")} /> Card</label>
              <label><input type="radio" value="momo" checked={paymentMethod==="momo"} onChange={()=>setPaymentMethod("momo")} /> Mobile Money</label>

              {paymentMethod==="card" && (
                <div className="card-details">
                  <input placeholder="Card Number" value={cardDetails.cardNumber} onChange={e=>setCardDetails({...cardDetails, cardNumber:e.target.value})} />
                  <input placeholder="Expiry (MM/YY)" value={cardDetails.expiry} onChange={e=>setCardDetails({...cardDetails, expiry:e.target.value})} />
                  <input placeholder="CVV" value={cardDetails.cvv} onChange={e=>setCardDetails({...cardDetails, cvv:e.target.value})} />
                </div>
              )}

              {paymentMethod==="momo" && (
                <div className="momo-details">
                  <input placeholder="Mobile Money Number" value={momoNumber} onChange={e=>setMomoNumber(e.target.value)} />
                </div>
              )}
            </div>

            <div className="checkout-actions-vertical">
              <button className="confirm-btn" onClick={confirmOrder} disabled={loading}>
                {loading ? <span className="spinner"></span> : "Confirm Order"}
              </button>
              <Link to="/"><button className="continue-btn">Continue Shopping</button></Link>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Modal */}
      {orderModal && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            {fulfillmentType === "pickup" ? (
              <>
                <h2>🎉 Order for Pickup!</h2>
                <p>Your order has been placed! We will notify you once it is ready. 😊</p>
              </>
            ) : (
              <>
                <h2>🚚 Order for Delivery</h2>
                <p>Your order has been placed! We will notify you once it is confirmed. 📦</p>
              </>
            )}
            <button onClick={handleCloseModal}>Awesome!</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default CheckoutPage;

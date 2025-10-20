import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [momoNumber, setMomoNumber] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [pickupWarning, setPickupWarning] = useState(false);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = fulfillmentType === "delivery" ? 20 : 0;
  const total = subtotal + deliveryFee;

  // ------------------- PLACE ORDER -------------------
  const placeOrder = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return navigate("/login");

    if (paymentMethod === "momo" && !momoNumber.trim()) {
      alert("Please enter your mobile money number.");
      return;
    }

    setLoading(true);

    const orderData = {
      items: cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor?._id || item.vendor,
      })),
      total,
      fulfillmentType,
      paymentMethod,
      ...(paymentMethod === "momo" ? { momoNumber } : {}),
    };

    // --- Hardcoded API with fallback ---
    const API_BASES = [
      "https://k-store-backend.onrender.com",
      "http://localhost:5000",
    ];
    let API_BASE = API_BASES[0];

    try {
      // Try to reach live backend first
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        // If live fails, try localhost
        console.warn("Falling back to localhost backend...");
        API_BASE = API_BASES[1];

        const localRes = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!localRes.ok) throw new Error("Order failed");
        const localData = await localRes.json();
        setCart({});
        setOrderModal(true);
        return;
      }

      const data = await res.json();
      setCart({});
      setOrderModal(true);
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- CONFIRM HANDLER -------------------
  const confirmOrder = () => {
    const uniqueVendors = [
      ...new Set(cartItems.map((item) => item.vendor?._id || item.vendor)),
    ];

    if (fulfillmentType === "pickup" && uniqueVendors.length > 1) {
      setPickupWarning(true);
      return;
    }

    placeOrder();
  };

  const handleProceedPickup = () => {
    setPickupWarning(false);
    placeOrder();
  };

  const handleCloseModal = () => {
    setOrderModal(false);
    navigate("/");
  };

  // ------------------- RENDER -------------------
  return (
    <div className="checkout-container">
      {cartItems.length === 0 ? (
        <div className="empty-checkout">
          <p>Your cart is empty 😢</p>
          <Link to="/">
            <button className="back-home-btn">Back to Store</button>
          </Link>
        </div>
      ) : (
        <div className="checkout-content">
          {/* Cart Items */}
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-card">
                <img
                  src={item.image}
                  alt={item.title}
                  className="checkout-image"
                />
                <div className="checkout-details">
                  <h3>{item.title}</h3>
                  <p className="vendor-info">
                    Vendor: {item.vendor?.username || "N/A"}
                  </p>
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
            {fulfillmentType === "delivery" && (
              <p>Delivery: GH₵{deliveryFee.toFixed(2)}</p>
            )}
            <hr />
            <h3>Total: GH₵{total.toFixed(2)}</h3>

            <div className="payment-section">
              <h4>Order Type</h4>
              <label>
                <input
                  type="radio"
                  value="pickup"
                  checked={fulfillmentType === "pickup"}
                  onChange={() => setFulfillmentType("pickup")}
                />{" "}
                Pick-up
              </label>
              <label>
                <input
                  type="radio"
                  value="delivery"
                  checked={fulfillmentType === "delivery"}
                  onChange={() => setFulfillmentType("delivery")}
                />{" "}
                Delivery
              </label>

              <h4>Payment Method</h4>
              <label>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />{" "}
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={() => setPaymentMethod("momo")}
                />{" "}
                Mobile Money (Coming Soon!)
              </label>

              {paymentMethod === "momo" && (
                <div className="momo-details">
                  <input
                    placeholder="Mobile Money Number(Coming Soon!)"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="checkout-actions-vertical">
              <button
                className="confirm-checkout"
                onClick={confirmOrder}
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : "Confirm Order"}
              </button>
              <Link to="/">
                <button className="continue-btn">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Warning Modal */}
      {pickupWarning && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <h2>⚠️ Multiple Vendors Detected</h2>
            <p>
              You selected <strong>Pickup</strong>, but your order contains items
              from <strong>different vendors</strong>. Each vendor may have a
              different pickup location.
            </p>
            <p>Are you sure you want to continue?</p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                style={{ background: "#16a34a" }}
                onClick={handleProceedPickup}
              >
                Yes, Continue
              </button>
              <button
                style={{ background: "#dc2626" }}
                onClick={() => setPickupWarning(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderModal && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            {fulfillmentType === "pickup" ? (
              <>
                <h2 className="checkout-head2">🎉 Order for Pickup!</h2>
                <p>
                  Your order has been placed successfully! We’ll notify you once
                  it’s ready for pickup. 😊
                </p>
              </>
            ) : (
              <>
                <h2 className="checkout-head2">🚚 Order for Delivery</h2>
                <p>
                  Your order has been placed successfully! We’ll notify you once
                  it’s confirmed and on its way. 📦
                </p>
              </>
            )}
            <button onClick={handleCloseModal}>Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;

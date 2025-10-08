import { Link } from "react-router-dom";
import "./CartPage.css";

function CartPage({ cart, setCart }) {
  const subtotal = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const removeItem = (id) => {
    const updatedCart = { ...cart };
    delete updatedCart[id];
    setCart(updatedCart);
  };

  return (
    <div className="carter">
      {Object.values(cart).length === 0 ? (
        <div className="nopro">
          <p className="empty">Your cart is empty</p>
          <Link to="/">
            <button className="contshop">Continue Shopping</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="headers">
            <h3 className="pone">Products</h3>
            <h3 className="ptwo">Quantity</h3>
            <h3 className="pthree">Price</h3>
            <h3 className="pfour">Total</h3>
          </div>
          <hr />

          <div className="allCheck">
            {Object.values(cart).map((item) => (
              <div key={item.id}>
                <div className="details">
                  <div className="one">
                    <div className="product-det">
                      <img src={item.image} className="pic" alt={item.title} />
                      <div className="para">
                        <h4 className="description">{item.title}</h4>
                        <h5 className="description">Brand</h5>
                      </div>
                    </div>
                  </div>

                  <input
                    type="number"
                    className="two"
                    value={item.quantity}
                    min="1"
                    onChange={(e) =>
                      setCart({
                        ...cart,
                        [item.id]: {
                          ...item,
                          quantity: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />

                  <div className="three">${item.price}</div>
                  <div className="four">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="five">
                    <button className="remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <hr />
              </div>
            ))}
          </div>

          <p className="below">Subtotal: ${subtotal.toFixed(2)}</p>
          <hr />
          <p className="below">Delivery: $20.00</p>
          <hr />
          <h2>Total: ${(subtotal + 20).toFixed(2)}</h2>
          <hr />

          <Link to="/">
            <button className="backshop">Continue Shopping</button>
          </Link>
          <Link to="/checkout">
            <button className="checkout">Checkout</button>
          </Link>
        </>
      )}
    </div>
  );
}

export default CartPage

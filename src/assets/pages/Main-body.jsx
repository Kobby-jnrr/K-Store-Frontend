import ProductList from "../components/Categories/ProductList";
import "./Main-body.css"
import { Link } from "react-router-dom";

function Main({ cart, setCart }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <main className="main">
      <div className="promo">
        🎉 Black Friday Mega Sale!! 🎉
        <span>Grab your deal now!!!!!!</span>
        <div className="countdown" id="countdown"></div>
      </div>

      {["fashion","electronics","home","grocery","baby","beauty","sports","gaming"].map((cat) => (
        <section key={cat} id={cat}>
          <h2>{cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}</h2>
          <ProductList category={cat} cart={cart} setCart={setCart} />
        </section>
      ))}

      <Link to={"/addProduct"}>
        {user?.role === "vendor" && (
          <button className="addproduct">➕ Add Product</button>
        )}
      </Link>

      <Link to={"/cartPage"}>
        <button className="go-cart">GO TO CART</button>
      </Link>
    </main>
  );
}

export default Main;

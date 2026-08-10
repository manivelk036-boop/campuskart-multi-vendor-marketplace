import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";

import "./App.css";

function App() {
  // =========================
  // LOGIN STATE
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // APP STATE
  // =========================

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (user) => {
    console.log("User logged in:", user);

    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  // =========================
  // GET PRODUCTS
  // =========================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    axios
      .get("http://localhost:8080/api/products")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, [isLoggedIn]);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product) => {
    setCartItems((previousItems) => {
      const existingProduct = previousItems.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          ...product,
          cartQuantity: 1,
        },
      ];
    });
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              cartQuantity: item.cartQuantity + 1,
            }
          : item
      )
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const decreaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                cartQuantity: item.cartQuantity - 1,
              }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== productId)
    );
  };

  // =========================
  // PLACE ORDER
  // =========================

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Make sure user is logged in
    if (!currentUser || !currentUser.id) {
      alert("Please login again.");
      return;
    }

    try {
      for (const item of cartItems) {
        const orderData = {
          userId: currentUser.id,
          productId: item.id,
          quantity: item.cartQuantity,
          totalPrice: Number(item.price) * item.cartQuantity,
          status: "PENDING",
        };

        console.log("Sending order:", orderData);

        await axios.post(
          "http://localhost:8080/api/orders",
          orderData
        );
      }

      alert("Order placed successfully!");

      setCartItems([]);
      setShowCart(false);
      setShowOrders(true);
    } catch (error) {
      console.error("Error placing order:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }

      alert(
        "Failed to place order. Please check your backend."
      );
    }
  };

  // =========================
  // CART COUNT
  // =========================

  const cartCount = cartItems.reduce(
    (total, item) => total + item.cartQuantity,
    0
  );

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================
  // HOME PAGE
  // =========================

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        onOrdersClick={() => setShowOrders(true)}
      />

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="hero" id="home">

        <div className="hero-content">

          <p className="hero-tag">
            🎓 YOUR CAMPUS MARKETPLACE
          </p>

          <h1>
            Everything You Need,
            <span> Right on Campus.</span>
          </h1>

          <p className="hero-description">
            Discover products from campus sellers,
            compare prices, and order everything you
            need in one place.
          </p>

          <button
            className="shop-btn"
            onClick={() => {
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Shop Now →
          </button>

        </div>

        {/* HERO CARD */}

        <div className="hero-card">

          <div className="hero-icon">
            🛍️
          </div>

          <h3>
            CampusKart
          </h3>

          <p>
            Buy • Sell • Connect
          </p>

        </div>

      </section>

      {/* =========================
          PRODUCTS SECTION
      ========================= */}

      <section
        className="products-section"
        id="products"
      >

        <div className="section-heading">

          <div>

            <p className="section-tag">
              OUR PRODUCTS
            </p>

            <h2>
              Featured Products
            </h2>

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <p className="loading">
            Loading products...
          </p>
        )}

        {/* NO PRODUCTS */}

        {!loading &&
          products.length === 0 && (

            <div className="empty">

              <h3>
                No products available
              </h3>

              <p>
                Add products through your
                Spring Boot backend.
              </p>

            </div>

          )}

        {/* PRODUCTS */}

        {!loading &&
          products.length > 0 && (

            <div className="product-grid">

              {products.map((product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />

              ))}

            </div>

          )}

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <div className="logo">

          Campus
          <span>
            Kart
          </span>

        </div>

        <p>
          © 2026 CampusKart.
          Your campus marketplace.
        </p>

      </footer>

      {/* =========================
          CART
      ========================= */}

      {showCart && (

        <Cart
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onPlaceOrder={placeOrder}
        />

      )}

      {/* =========================
          ORDERS
      ========================= */}

      {showOrders && (

        <div className="orders-overlay">

          <div className="orders-panel">

            <button
              className="close-btn"
              onClick={() => setShowOrders(false)}
            >
              ✕
            </button>

            <Orders />

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

const API_BASE_URL = "http://localhost:8080/api";

function App() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // CUSTOMER STATE
  // =========================================================

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = (user) => {
    console.log("FULL USER:", user);
    console.log("USER ROLE:", user?.role);

    setCurrentUser(user);
    setIsLoggedIn(true);

    // Reset customer UI after login
    setCartItems([]);
    setShowCart(false);
    setShowOrders(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    console.log("Logging out:", currentUser);

    setCurrentUser(null);
    setIsLoggedIn(false);

    setProducts([]);
    setCartItems([]);

    setShowCart(false);
    setShowOrders(false);

    setLoading(false);
  };

  // =========================================================
  // GET PRODUCTS
  // CUSTOMER ONLY
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    // Don't load customer products for SELLER / ADMIN
    if (
      currentUser?.role === "SELLER" ||
      currentUser?.role === "ADMIN"
    ) {
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/products`
        );

        setProducts(response.data);
      } catch (error) {
        console.error(
          "Error fetching products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isLoggedIn, currentUser]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = (product) => {
    if (Number(product.quantity) <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCartItems((previousItems) => {
      const existingProduct = previousItems.find(
        (item) => item.id === product.id
      );

      // Product already exists in cart
      if (existingProduct) {
        // Don't allow cart quantity above stock
        if (
          existingProduct.cartQuantity >=
          Number(product.quantity)
        ) {
          alert(
            `Only ${product.quantity} items are available.`
          );

          return previousItems;
        }

        return previousItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity:
                  item.cartQuantity + 1,
              }
            : item
        );
      }

      // New product
      return [
        ...previousItems,
        {
          ...product,
          cartQuantity: 1,
        },
      ];
    });
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const increaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const availableStock =
          Number(item.quantity);

        if (
          item.cartQuantity >= availableStock
        ) {
          alert(
            `Only ${availableStock} items are available.`
          );

          return item;
        }

        return {
          ...item,
          cartQuantity:
            item.cartQuantity + 1,
        };
      })
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const decreaseQuantity = (productId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                cartQuantity:
                  item.cartQuantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.cartQuantity > 0
        )
    );
  };

  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== productId
      )
    );
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (
      !currentUser ||
      !currentUser.id
    ) {
      alert("Please login again.");
      return;
    }

    try {
      // Validate stock before placing orders
      for (const item of cartItems) {
        if (
          item.cartQuantity >
          Number(item.quantity)
        ) {
          alert(
            `${item.productName} does not have enough stock.`
          );

          return;
        }
      }

      // Create order for each cart item
      for (const item of cartItems) {
        const orderData = {
          userId: currentUser.id,
          productId: item.id,
          quantity: item.cartQuantity,
          totalPrice:
            Number(item.price) *
            item.cartQuantity,
          status: "PENDING",
        };

        console.log(
          "Sending order:",
          orderData
        );

        await axios.post(
          `${API_BASE_URL}/orders`,
          orderData
        );
      }

      alert(
        "Order placed successfully!"
      );

      setCartItems([]);
      setShowCart(false);
      setShowOrders(true);
    } catch (error) {
      console.error(
        "Error placing order:",
        error
      );

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

  // =========================================================
  // CART COUNT
  // =========================================================

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.cartQuantity,
    0
  );

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // =========================================================
  // SELLER DASHBOARD
  // =========================================================

  if (
    currentUser?.role === "SELLER"
  ) {
    return (
      <SellerDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  if (
    currentUser?.role === "ADMIN"
  ) {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // =========================================================
  // CUSTOMER PAGE
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        cartCount={cartCount}
        onCartClick={() =>
          setShowCart(true)
        }
        onOrdersClick={() =>
          setShowOrders(true)
        }
        onLogout={handleLogout}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero"
        id="home"
      >
        <div className="hero-content">

          <p className="hero-tag">
            🎓 YOUR CAMPUS MARKETPLACE
          </p>

          <h1>
            Everything You Need,
            <span>
              {" "}
              Right on Campus.
            </span>
          </h1>

          <p className="hero-description">
            Discover products from campus
            sellers, compare prices, and order
            everything you need in one place.
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

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

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
                Sellers can add products
                through their dashboard.
              </p>

            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          products.length > 0 && (
            <div className="product-grid">

              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={
                      addToCart
                    }
                  />
                )
              )}

            </div>
          )}

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

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

      {/* =====================================================
          CART
      ===================================================== */}

      {showCart && (
        <Cart
          cartItems={cartItems}
          onClose={() =>
            setShowCart(false)
          }
          onRemove={
            removeFromCart
          }
          onIncrease={
            increaseQuantity
          }
          onDecrease={
            decreaseQuantity
          }
          onPlaceOrder={
            placeOrder
          }
        />
      )}

      {/* =====================================================
          CUSTOMER ORDERS
      ===================================================== */}

      {showOrders && (
        <div className="orders-overlay">

          <div className="orders-panel">

            <button
              className="close-btn"
              onClick={() =>
                setShowOrders(false)
              }
            >
              ✕
            </button>

            <Orders
              userId={currentUser?.id}
            />

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
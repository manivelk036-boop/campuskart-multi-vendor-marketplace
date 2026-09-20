import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import apiClient, { API_BASE_URL, getStoredAuth, AUTH_STORAGE_KEY } from "./apiClient";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import ProductDetails from "./components/ProductDetails";
import { resolveImageUrl } from "./utils/imageUrl";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

const DEFAULT_SORT = "relevance";

function App() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [currentUser, setCurrentUser] = useState(() => getStoredAuth());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredAuth()));

  // =========================================================
  // CUSTOMER STATE
  // =========================================================

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);

  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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
    setShowWishlist(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    console.log("Logging out:", currentUser);

    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    setProducts([]);
    setCartItems([]);

    setShowCart(false);
    setShowOrders(false);
    setShowWishlist(false);
    setWishlistItems([]);

    setLoading(false);
  };

  // =========================================================
  // LOAD CUSTOMER PRODUCT SEARCH FILTERS
  // CUSTOMER ONLY
  // =========================================================

  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories`
      );

      const categoryNames = Array.isArray(response.data)
        ? response.data
            .map((category) => category.name)
            .filter(Boolean)
        : [];

      setCategories(categoryNames);
    } catch (error) {
      console.error(
        "Error fetching category list:",
        error
      );

      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async (overrides = {}) => {
    if (!isLoggedIn) {
      return;
    }

    if (
      currentUser?.role === "SELLER" ||
      currentUser?.role === "ADMIN"
    ) {
      return;
    }

    try {
      setLoading(true);

      const activeKeyword = overrides.keyword ?? keyword;
      const activeCategory = overrides.category ?? selectedCategory;
      const activeMinPrice = overrides.minPrice ?? minPrice;
      const activeMaxPrice = overrides.maxPrice ?? maxPrice;
      const activeSort = overrides.sort ?? sort;

      const params = new URLSearchParams();

      if (activeKeyword.trim()) {
        params.append("keyword", activeKeyword.trim());
      }

      if (
        activeCategory &&
        activeCategory !== "All Categories"
      ) {
        params.append("category", activeCategory);
      }

      if (activeMinPrice !== "") {
        params.append("minPrice", activeMinPrice);
      }

      if (activeMaxPrice !== "") {
        params.append("maxPrice", activeMaxPrice);
      }

      if (activeSort && activeSort !== DEFAULT_SORT) {
        params.append("sort", activeSort);
      }

      const response = await axios.get(
        `${API_BASE_URL}/products/search`,
        {
          params,
        }
      );

      const serverPage = response.data;
      const list = Array.isArray(serverPage)
        ? serverPage
        : serverPage?.content || [];

      setProducts(list);
    } catch (error) {
      console.error(
        "Error fetching products:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isLoggedIn, keyword, maxPrice, minPrice, selectedCategory, sort]);

  const loadWishlist = useCallback(async () => {
    if (!isLoggedIn || currentUser?.role !== "CUSTOMER") {
      setWishlistItems([]);
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistError("");
      const response = await apiClient.get("/wishlist");
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishlistError("Unable to load your wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  }, [currentUser, isLoggedIn]);

  const loadSuggestions = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("keyword", trimmedQuery);
      params.append("size", "6");

      const response = await axios.get(
        `${API_BASE_URL}/products/search`,
        { params }
      );

      const serverPage = response.data;
      const list = Array.isArray(serverPage)
        ? serverPage
        : serverPage?.content || [];

      setSuggestions(list.slice(0, 6));
    } catch (error) {
      console.error("Suggestion search failed:", error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return undefined;
    }

    if (
      currentUser?.role === "SELLER" ||
      currentUser?.role === "ADMIN"
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      void loadCategories();
      void loadProducts();
      void loadWishlist();
    }, 0);

    return () => clearTimeout(timer);
  }, [currentUser, isLoggedIn, loadCategories, loadProducts, loadWishlist]);

  useEffect(() => {
    if (!keyword.trim()) {
      return undefined;
    }

    const timer = setTimeout(() => {
      void loadSuggestions(keyword);
      setShowSuggestions(true);
    }, 240);

    return () => clearTimeout(timer);
  }, [keyword, loadSuggestions]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setShowSuggestions(false);
    loadProducts({ keyword, category: selectedCategory, minPrice, maxPrice, sort });
  };

  const onSuggestionClick = (product) => {
    const selectedKeyword = product.productName || product.name || "";
    setKeyword(selectedKeyword);
    setSelectedCategory("All Categories");
    setMinPrice("");
    setMaxPrice("");
    setSort(DEFAULT_SORT);
    setShowSuggestions(false);
    loadProducts({
      keyword: selectedKeyword,
      category: "All Categories",
      minPrice: "",
      maxPrice: "",
      sort: DEFAULT_SORT,
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedCategory("All Categories");
    setMinPrice("");
    setMaxPrice("");
    setSort(DEFAULT_SORT);
    setShowSuggestions(false);
    loadProducts({
      keyword: "",
      category: "All Categories",
      minPrice: "",
      maxPrice: "",
      sort: DEFAULT_SORT,
    });
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const isWishlisted = (productId) => wishlistItems.some(
    (item) => Number(item.productId) === Number(productId)
  );

  const toggleWishlist = async (product) => {
    if (!currentUser || currentUser.role !== "CUSTOMER") {
      alert("Please login as a customer to use your wishlist.");
      return;
    }

    try {
      if (isWishlisted(product.id)) {
        await apiClient.delete(`/wishlist/${product.id}`);
        setWishlistItems((items) => items.filter(
          (item) => Number(item.productId) !== Number(product.id)
        ));
      } else {
        const response = await apiClient.post(`/wishlist/${product.id}`);
        setWishlistItems((items) => [response.data, ...items]);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update your wishlist.");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await apiClient.delete(`/wishlist/${productId}`);
      setWishlistItems((items) => items.filter(
        (item) => Number(item.productId) !== Number(productId)
      ));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to remove this product.");
    }
  };

  const moveWishlistItemToCart = (item) => {
    if (Number(item.quantity) <= 0) {
      return;
    }

    addToCart({
      id: item.productId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
      seller: { fullName: item.sellerName },
    });
  };

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

  const placeOrder = async (paymentMethod, deliveryAddress, coupon, couponItems) => {
    if (isPlacingOrder) {
      return;
    }

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
      setIsPlacingOrder(true);

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

      const createdOrders = [];

      // Create order for each cart item
      for (const [index, item] of cartItems.entries()) {
        const orderData = {
          userId: currentUser.id,
          productId: item.id,
          quantity: item.cartQuantity,
          totalPrice:
            Number(item.price) *
            item.cartQuantity,
          status: "PENDING",
          deliveryAddress: deliveryAddress.address.trim(),
          deliveryCity: deliveryAddress.city.trim(),
          deliveryState: deliveryAddress.state.trim(),
          deliveryPincode: deliveryAddress.pincode.trim(),
          deliveryLatitude: deliveryAddress.latitude,
          deliveryLongitude: deliveryAddress.longitude,
          couponCode: coupon?.couponCode || null,
          couponUsageClaim: paymentMethod === "CASH_ON_DELIVERY" && Boolean(coupon?.couponCode) && index === cartItems.length - 1,
          checkoutItems: couponItems || [],
        };

        console.log(
          "Sending order:",
          orderData
        );

        const orderResponse = await apiClient.post(
          "/orders",
          orderData
        );

        if (!orderResponse.data?.id) {
          throw new Error("The order response did not include an order ID.");
        }

        createdOrders.push({
          orderId: orderResponse.data.id,
          amount: Number(orderResponse.data.totalPrice),
        });
      }

      if (paymentMethod !== "CASH_ON_DELIVERY") {
        for (const [index, order] of createdOrders.entries()) {
          await apiClient.post("/payments", {
            orderId: order.orderId,
            amount: order.amount,
            paymentMethod,
            couponUsageClaim: Boolean(coupon?.couponCode) && index === createdOrders.length - 1,
          });
        }
      }

      alert(
        paymentMethod === "CASH_ON_DELIVERY"
          ? "Order placed successfully. Pay on delivery."
          : "Payment successful! Your order has been placed."
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
        "We could not complete your order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
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
        keyword={keyword}
        onKeywordChange={(value) => {
          setKeyword(value);
          if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            setShowSuggestions(true);
          }
        }}
        onSearchSubmit={handleSearchSubmit}
        onCartClick={() =>
          setShowCart(true)
        }
        onOrdersClick={() =>
          setShowOrders(true)
        }
        onNotificationsOrderClick={() =>
          setShowOrders(true)
        }
        onWishlistClick={() => setShowWishlist(true)}
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

        <div className="search-layout">
          <aside className="filter-sidebar">
            <div className="filter-sidebar-heading">
              <span>Filters</span>
              <button className="clear-btn sidebar-clear" type="button" onClick={clearFilters}>Clear Filters</button>
            </div>

            <div className="filter-block">
              <label className="filter-label">Category</label>
              <select className="category-select" value={selectedCategory} onChange={(event) => {
                const categoryValue = event.target.value;
                setSelectedCategory(categoryValue);
                loadProducts({
                  keyword,
                  category: categoryValue,
                  minPrice,
                  maxPrice,
                  sort,
                });
              }}>
                <option>All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-block price-filter-block">
              <label className="filter-label">Price range</label>
              <div className="price-fields">
                <input className="price-input" type="number" min="0" value={minPrice} placeholder="Min price" onChange={(event) => {
                  const minValue = event.target.value;
                  setMinPrice(minValue);
                  loadProducts({
                    keyword,
                    category: selectedCategory,
                    minPrice: minValue,
                    maxPrice,
                    sort,
                  });
                }} />
                <input className="price-input" type="number" min="0" value={maxPrice} placeholder="Max price" onChange={(event) => {
                  const maxValue = event.target.value;
                  setMaxPrice(maxValue);
                  loadProducts({
                    keyword,
                    category: selectedCategory,
                    minPrice,
                    maxPrice: maxValue,
                    sort,
                  });
                }} />
              </div>
            </div>

            <div className="filter-block">
              <label className="filter-label">Sort</label>
              <select className="sort-select" value={sort} onChange={(event) => {
                const sortValue = event.target.value;
                setSort(sortValue);
                loadProducts({
                  keyword,
                  category: selectedCategory,
                  minPrice,
                  maxPrice,
                  sort: sortValue,
                });
              }}>
                <option value="relevance">Relevance / Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest-first">Newest First</option>
              </select>
            </div>
          </aside>

          <div className="results-main">
            <form className="product-search-panel" onSubmit={handleSearchSubmit}>
              <div className="search-row">
                <div className="search-input-wrap">
                  <span className="search-icon" aria-hidden="true">⌕</span>
                  <input className="search-input" type="search" value={keyword} placeholder="Search CampusKart products" onChange={(event) => {
                    const value = event.target.value;
                    setKeyword(value);
                    if (!value.trim()) {
                      setSuggestions([]);
                      setShowSuggestions(false);
                    } else {
                      setShowSuggestions(true);
                    }
                  }} onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      setShowSuggestions(false);
                      loadProducts({
                        keyword: event.target.value,
                        category: selectedCategory,
                        minPrice,
                        maxPrice,
                        sort,
                      });
                    }
                  }} />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {suggestions.map((product) => (
                        <button key={product.id} className="suggestion-item" type="button" onClick={() => onSuggestionClick(product)}>
                          <span className="suggestion-thumb">
                            {product.imageUrl ? <img src={resolveImageUrl(product.imageUrl)} alt="" /> : <span aria-hidden="true">🛍️</span>}
                          </span>
                          <span className="suggestion-name">{product.productName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="search-btn" type="submit">
                  Search
                </button>

                <button className="clear-btn" type="button" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </form>

            <div className="results-toolbar">
              <div className="result-count">
                <strong>{products.length}</strong> results
                {keyword && <span className="search-keyword">for “{keyword}”</span>}
              </div>
              <div className="sort-inline">
                <label className="filter-label">Sort By</label>
                <select className="sort-select" value={sort} onChange={(event) => {
                  const sortValue = event.target.value;
                  setSort(sortValue);
                  loadProducts({
                    keyword,
                    category: selectedCategory,
                    minPrice,
                    maxPrice,
                    sort: sortValue,
                  });
                }}>
                  <option value="relevance">Relevance / Default</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest-first">Newest First</option>
                </select>
              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <p className="loading">
                Loading products...
              </p>
            )}

            {/* NO PRODUCTS */}

            {!loading && products.length === 0 && (
              <div className="empty">
                <h3>No products found</h3>
                <p>Try a broader search or clear your filters.</p>
              </div>
            )}

            {/* PRODUCTS */}

            {!loading && products.length > 0 && (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onViewDetails={openProductDetails}
                    isWishlisted={isWishlisted(product.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

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
          isProcessing={isPlacingOrder}
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
                currentUser={currentUser}
              onReviewProduct={openProductDetails}
            />

          </div>

        </div>
      )}

      {showWishlist && (
        <Wishlist
          items={wishlistItems}
          loading={wishlistLoading}
          error={wishlistError}
          onClose={() => setShowWishlist(false)}
          onRemove={removeFromWishlist}
          onMoveToCart={moveWishlistItemToCart}
        />
      )}

      {selectedProduct && (
        <ProductDetails
          key={selectedProduct.id}
          product={selectedProduct}
          currentUser={currentUser}
          isWishlisted={isWishlisted(selectedProduct.id)}
          onToggleWishlist={toggleWishlist}
          onAddToCart={(product) => { addToCart(product); setSelectedProduct(null); }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}

export default App;
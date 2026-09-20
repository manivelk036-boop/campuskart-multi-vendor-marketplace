import Notifications from "./Notifications";

function Navbar({
  cartCount,
  onCartClick,
  onOrdersClick,
  onWishlistClick,
  onNotificationsOrderClick,
  onLogout,
  keyword,
  onKeywordChange,
  onSearchSubmit,
}) {
  return (
    <>
      <nav className="navbar">

      {/* =========================
          LOGO
      ========================= */}

        <button className="logo" type="button" onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}>
          <span className="logo-mark">CK</span>
          <span>Campus<span>Kart</span></span>
        </button>

        <form className="navbar-search" onSubmit={onSearchSubmit}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search for products, categories and more"
            aria-label="Search products"
          />
          <button type="submit" aria-label="Submit product search">Search</button>
        </form>

      {/* =========================
          NAVIGATION
      ========================= */}

        <div className="nav-links">

        <button
          onClick={() => {
            document
              .getElementById("home")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          🏠 Home
        </button>

        <button
          onClick={() => {
            document
              .getElementById("products")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          🛍️ Products
        </button>

        <button onClick={onOrdersClick}>
          📦 My Orders
        </button>

        <button onClick={onWishlistClick}>
          ♡ Wishlist
        </button>

        </div>

      {/* =========================
          RIGHT ACTIONS
      ========================= */}

        <div className="nav-actions">

          <Notifications onOpenOrders={onNotificationsOrderClick} />

        {/* CART */}

          <button className="account-btn" onClick={onLogout}>
            <span className="account-avatar">Y</span>
            <span><small>Account</small><strong>Sign out</strong></span>
          </button>

          <button className="cart-btn" onClick={onCartClick}>
            <span aria-hidden="true">🛒</span> Cart <b>{cartCount}</b>
          </button>

        </div>

      </nav>
      <div className="category-bar">
        <div className="category-bar-inner">
          <span className="category-bar-label">Shop by category</span>
          <button type="button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>All products</button>
          <button type="button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>Study essentials</button>
          <button type="button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>Daily needs</button>
          <button type="button" onClick={onOrdersClick}>Track your orders</button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
function Navbar({
  cartCount,
  onCartClick,
  onOrdersClick,
  onLogout,
}) {
  return (
    <nav className="navbar">

      {/* =========================
          LOGO
      ========================= */}

      <div className="logo">
        Campus<span>Kart</span>
      </div>

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

      </div>

      {/* =========================
          RIGHT ACTIONS
      ========================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >

        {/* CART */}

        <button
          className="cart-btn"
          onClick={onCartClick}
        >
          🛒 Cart ({cartCount})
        </button>

        {/* LOGOUT */}

        <button
          onClick={onLogout}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#dc2626",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;
function Navbar({ cartCount, onCartClick, onOrdersClick }) {
  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        Campus<span>Kart</span>
      </div>

      {/* Navigation */}
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
          Home
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
          Products
        </button>

        <button onClick={onOrdersClick}>
          My Orders
        </button>

      </div>

      {/* Cart */}
      <button
        className="cart-btn"
        onClick={onCartClick}
      >
        🛒 Cart ({cartCount})
      </button>

    </nav>
  );
}

export default Navbar;
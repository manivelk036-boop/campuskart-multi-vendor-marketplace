function Navbar({ cartCount, onCartClick }) {
  return (
    <nav className="navbar">
      <div className="logo">
        Campus<span>Kart</span>
      </div>

      <div className="nav-links">
        <button>Home</button>
        <button>Products</button>
        <button>My Orders</button>
      </div>

      <button className="cart-btn" onClick={onCartClick}>
        🛒 Cart ({cartCount})
      </button>
    </nav>
  );
}

export default Navbar;
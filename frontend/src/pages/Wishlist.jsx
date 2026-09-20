import "./Wishlist.css";
import { resolveImageUrl } from "../utils/imageUrl";

function Wishlist({ items, loading, error, onClose, onRemove, onMoveToCart }) {
  return (
    <div className="wishlist-overlay">
      <section className="wishlist-panel" aria-label="Wishlist">
        <header className="wishlist-header">
          <div>
            <p className="section-tag">SAVED FOR LATER</p>
            <h2>My Wishlist</h2>
          </div>
          <button className="close-btn" type="button" onClick={onClose} aria-label="Close wishlist">✕</button>
        </header>

        {loading ? <p className="wishlist-state">Loading your wishlist...</p> : error ? <p className="wishlist-state wishlist-error">{error}</p> : items.length === 0 ? (
          <div className="wishlist-state">
            <div className="empty-cart-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products here while you decide.</p>
          </div>
        ) : (
          <div className="wishlist-list">
            {items.map((item) => {
              const outOfStock = Number(item.quantity) <= 0;
              return (
                <article className="wishlist-item" key={item.id}>
                  <div className="wishlist-image">
                    {item.imageUrl ? <img src={resolveImageUrl(item.imageUrl)} alt={item.productName} /> : <span aria-hidden="true">🛍️</span>}
                  </div>
                  <div className="wishlist-copy">
                    <h3>{item.productName}</h3>
                    <p>Sold by {item.sellerName || "CampusKart Seller"}</p>
                    <strong>₹{Number(item.price || 0).toLocaleString("en-IN")}</strong>
                    <span className={outOfStock ? "wishlist-stock out" : "wishlist-stock"}>
                      {outOfStock ? "Out of Stock" : `In stock · ${item.quantity} available`}
                    </span>
                  </div>
                  <div className="wishlist-actions">
                    <button type="button" disabled={outOfStock} onClick={() => onMoveToCart(item)}>
                      {outOfStock ? "Out of Stock" : "Move to Cart"}
                    </button>
                    <button type="button" className="wishlist-remove" onClick={() => onRemove(item.productId)}>
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Wishlist;

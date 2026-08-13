function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = Number(product.quantity) <= 0;

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-image">
        🛍️
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-info">

        <span className="category">
          {product.category || "General"}
        </span>

        <h3>{product.productName}</h3>

        <p className="description">
          {product.description || "No description available."}
        </p>

        <p className={`stock ${isOutOfStock ? "out-of-stock" : ""}`}>
          {isOutOfStock
            ? "Out of stock"
            : `Stock available: ${product.quantity}`}
        </p>

        <div className="product-bottom">

          <strong>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </strong>

          <button
            className="add-btn"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;
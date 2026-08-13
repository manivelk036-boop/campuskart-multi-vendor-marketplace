
function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = Number(product.quantity) <= 0;

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE / ICON */}
      <div className="product-image">
        🛍️
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-info">

        {/* CATEGORY */}
        <span className="category">
          {product.category || "General"}
        </span>

        {/* PRODUCT NAME */}
        <h3>
          {product.productName}
        </h3>

        {/* DESCRIPTION */}
        <p className="description">
          {product.description || "No description available."}
        </p>

        {/* STOCK */}
        <p
          className={`stock ${
            isOutOfStock ? "out-of-stock" : ""
          }`}
        >
          {isOutOfStock
            ? "❌ Out of Stock"
            : `📦 ${product.quantity} available`}
        </p>

        {/* PRICE + BUTTON */}
        <div className="product-bottom">

          <strong className="product-price">
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </strong>

          <button
            className="add-btn"
            onClick={() => {
              if (!isOutOfStock) {
                onAddToCart(product);
              }
            }}
            disabled={isOutOfStock}
          >
            {isOutOfStock
              ? "Out of Stock"
              : "🛒 Add to Cart"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;
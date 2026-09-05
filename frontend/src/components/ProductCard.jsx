import { useState } from "react";

function ProductCard({ product, onAddToCart }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = Number(product.quantity) <= 0;
  const imageUrl = product.imageUrl || product.image;

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-image">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.productName}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="product-placeholder" aria-hidden="true">
            🛍️
          </span>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-info">

        <span className="category">
          {product.category?.name || "General"}
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
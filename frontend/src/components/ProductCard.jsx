import { useState } from "react";

function ProductCard({ product, onAddToCart, onViewDetails }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = Number(product.quantity) <= 0;
  const imageUrl = product.imageUrl || product.image;
  const sellerName = product.seller?.fullName || product.seller?.name || product.seller?.email || "CampusKart Seller";

  return (
    <article className="product-card product-list-card">

      {/* PRODUCT IMAGE */}
      <div className="product-image">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.productName}
            onError={() => setImageFailed(true)}
            className="product-image-content"
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

        <h3 className="product-name">{product.productName}</h3>

        <div className="product-detail-meta">
          <span className="product-seller">Sold by {sellerName}</span>
          <span className="product-category-label">{product.category?.name || "General"}</span>
        </div>

        <p className="description">
          {product.description || "No description available."}
        </p>

        <p className={`stock ${isOutOfStock ? "out-of-stock" : ""}`}>
          {isOutOfStock
            ? "Out of stock"
            : `Stock available: ${product.quantity}`}
        </p>

        <div className="product-bottom">
          <div className="product-price-wrap">
            <strong className="product-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="product-actions">
            <button className="view-detail-btn" type="button" onClick={() => onViewDetails?.(product)}>
              View Details
            </button>
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

    </article>
  );
}

export default ProductCard;
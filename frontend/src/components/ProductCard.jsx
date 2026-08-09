function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">

      <div className="product-image">
        🛍️
      </div>

      <div className="product-info">

        <span className="category">
          {product.category}
        </span>

        <h3>
          {product.productName}
        </h3>

        <p className="description">
          {product.description}
        </p>

        <p className="stock">
          Stock: {product.quantity}
        </p>

        <div className="product-bottom">

          <strong>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </strong>

          <button
            className="add-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.quantity <= 0}
          >
            {product.quantity > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;
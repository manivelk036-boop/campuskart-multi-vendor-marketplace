function Cart({ cartItems, onClose, onRemove, onIncrease, onDecrease, onPlaceOrder }) {
  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.cartQuantity,
    0
  );

  return (
    <div className="cart-overlay">
      <div className="cart-panel">

        <div className="cart-header">
          <h2>🛒 Your Cart</h2>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add products from the marketplace.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">

              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>

                  <div className="cart-item-image">
                    🛍️
                  </div>

                  <div className="cart-item-details">
                    <h3>{item.productName}</h3>

                    <p>{item.category}</p>

                    <strong>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </strong>

                    <div className="quantity-control">

                      <button
                        onClick={() => onDecrease(item.id)}
                      >
                        −
                      </button>

                      <span>{item.cartQuantity}</span>

                      <button
                        onClick={() => onIncrease(item.id)}
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>

                </div>
              ))}

            </div>

            <div className="cart-summary">

              <div className="total-row">
                <span>Total</span>

                <strong>
                  ₹{totalPrice.toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                className="checkout-btn"
                onClick={onPlaceOrder}
              >
                Place Order
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Cart;
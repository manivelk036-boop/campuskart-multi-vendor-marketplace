import { useState } from "react";

function Cart({
  cartItems,
  onClose,
  onRemove,
  onIncrease,
  onDecrease,
  onPlaceOrder,
}) {
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.cartQuantity),
    0
  );

  const deliveryFee = cartItems.length > 0 ? 0 : 0;

  const grandTotal = subtotal + deliveryFee;

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    onPlaceOrder();
  };

  return (
    <div className="cart-overlay">
      <div className="cart-panel">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="cart-header">
          <h2>
            {showCheckout ? "💳 Checkout" : "🛒 Your Cart"}
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* =====================================================
            EMPTY CART
        ===================================================== */}

        {cartItems.length === 0 ? (
          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add products from the marketplace.
            </p>

          </div>
        ) : !showCheckout ? (

          /* ===================================================
             CART VIEW
          =================================================== */

          <>
            <div className="cart-items">

              {cartItems.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-item-image">
                    🛍️
                  </div>

                  <div className="cart-item-details">

                    <h3>
                      {item.productName}
                    </h3>

                    <p>
                      {item.category}
                    </p>

                    <strong>
                      {formatMoney(item.price)}
                    </strong>

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          onDecrease(item.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.cartQuantity}
                      </span>

                      <button
                        onClick={() =>
                          onIncrease(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      onRemove(item.id)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

            {/* CART SUMMARY */}

            <div className="cart-summary">

              <div className="total-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatMoney(subtotal)}
                </strong>
              </div>

              <div className="total-row">
                <span>
                  Delivery
                </span>

                <strong>
                  {deliveryFee === 0
                    ? "FREE"
                    : formatMoney(deliveryFee)}
                </strong>
              </div>

              <div className="checkout-total-row">
                <span>
                  Total
                </span>

                <strong>
                  {formatMoney(grandTotal)}
                </strong>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>

            </div>

          </>

        ) : (

          /* ===================================================
             CHECKOUT VIEW
          =================================================== */

          <div className="checkout-page">

            {/* CHECKOUT HEADER */}

            <div className="checkout-intro">

              <div className="checkout-icon">
                📦
              </div>

              <div>
                <h3>
                  Review Your Order
                </h3>

                <p>
                  Please check your items before placing
                  the order.
                </p>
              </div>

            </div>

            {/* ORDER ITEMS */}

            <div className="checkout-items">

              {cartItems.map((item) => (

                <div
                  className="checkout-item"
                  key={item.id}
                >

                  <div className="checkout-item-info">

                    <strong>
                      {item.productName}
                    </strong>

                    <span>
                      {item.category}
                    </span>

                  </div>

                  <div className="checkout-item-quantity">
                    × {item.cartQuantity}
                  </div>

                  <strong>
                    {formatMoney(
                      Number(item.price) *
                      Number(item.cartQuantity)
                    )}
                  </strong>

                </div>

              ))}

            </div>

            {/* DELIVERY INFO */}

            <div className="checkout-info-card">

              <h4>
                🚚 Delivery Information
              </h4>

              <p>
                Your order will be delivered through
                the campus marketplace.
              </p>

              <span>
                📍 Campus Delivery
              </span>

            </div>

            {/* PRICE SUMMARY */}

            <div className="checkout-summary">

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatMoney(subtotal)}
                </strong>
              </div>

              <div>
                <span>
                  Delivery
                </span>

                <strong>
                  FREE
                </strong>
              </div>

              <div className="checkout-grand-total">
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatMoney(grandTotal)}
                </strong>
              </div>

            </div>

            {/* ACTION BUTTONS */}

            <div className="checkout-actions">

              <button
                className="back-cart-btn"
                onClick={() =>
                  setShowCheckout(false)
                }
              >
                ← Back to Cart
              </button>

              <button
                className="confirm-order-btn"
                onClick={handleConfirmOrder}
              >
                ✓ Confirm & Place Order
              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default Cart;
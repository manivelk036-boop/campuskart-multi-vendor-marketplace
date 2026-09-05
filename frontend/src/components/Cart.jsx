import { useState } from "react";

function Cart({
  cartItems,
  onClose,
  onRemove,
  onIncrease,
  onDecrease,
  onPlaceOrder,
  isProcessing,
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

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
    onPlaceOrder(paymentMethod);
  };

  return (
    <div className={`cart-overlay ${showCheckout ? "checkout-overlay" : ""}`}>
      <div className={`cart-panel ${showCheckout ? "checkout-panel" : ""}`}>

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
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                      />
                    ) : (
                      <span className="cart-image-placeholder" aria-hidden="true">
                        🛍️
                      </span>
                    )}
                  </div>

                  <div className="cart-item-details">

                    <h3>
                      {item.productName}
                    </h3>

                    <p>
                      {item.category?.name || "General"}
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

                    <div className="checkout-item-image">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                        />
                      ) : (
                        <span className="cart-image-placeholder" aria-hidden="true">
                          🛍️
                        </span>
                      )}
                    </div>

                    <div className="checkout-item-copy">
                      <strong>
                        {item.productName}
                      </strong>

                      <span>
                        {item.category?.name || "General"}
                      </span>
                    </div>

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

            {/* PAYMENT METHOD */}

            <div className="payment-method-section">

              <div className="payment-method-heading">
                <h4>Payment Method</h4>
                <span>Choose how you would like to pay</span>
              </div>

              <div className="payment-method-options">
                {[
                  ["UPI", "UPI", "Pay securely using UPI"],
                  ["CARD", "Card", "Pay with your debit or credit card"],
                  [
                    "CASH_ON_DELIVERY",
                    "Cash on Delivery",
                    "Pay when your order arrives",
                  ],
                ].map(([value, label, description]) => (
                  <label
                    className={`payment-method-option ${
                      paymentMethod === value ? "selected" : ""
                    }`}
                    key={value}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                      disabled={isProcessing}
                    />
                    <span className="payment-method-copy">
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </div>

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
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : paymentMethod === "CASH_ON_DELIVERY"
                  ? "✓ Place Order"
                  : "✓ Pay Now"}
              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default Cart;
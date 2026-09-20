import { useState } from "react";
import apiClient from "../apiClient";
import { resolveImageUrl } from "../utils/imageUrl";

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
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
  });
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.cartQuantity),
    0
  );

  const deliveryFee = cartItems.length > 0 ? 0 : 0;

  const grandTotal = subtotal + deliveryFee;
  const discountAmount = Number(appliedCoupon?.discountAmount || 0);
  const checkoutTotal = Math.max(0, grandTotal - discountAmount);
  const couponItems = cartItems.map((item) => ({
    productId: item.id,
    quantity: Number(item.cartQuantity),
  }));

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
    if (Object.values(deliveryAddress).slice(0, 4).some((value) => !value.trim())) {
      setLocationError("Please complete your delivery address before placing the order.");
      return;
    }

    setLocationError("");
    onPlaceOrder(paymentMethod, deliveryAddress, appliedCoupon, couponItems);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code.");
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const response = await apiClient.post("/coupons/apply", {
        code: couponCode,
        items: couponItems,
      });
      setAppliedCoupon(response.data);
      setCouponCode(response.data.couponCode);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.response?.data?.message || error.response?.data || "This coupon cannot be applied.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await apiClient.post("/coupons/remove");
    } catch {
      // Coupon state is checkout-local; the remove endpoint is intentionally idempotent.
    }
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const updateAddress = (field, value) => {
    setDeliveryAddress((current) => ({ ...current, [field]: value }));
    setLocationError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable in this browser. You can enter your address manually.");
      return;
    }

    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
        );
        if (!response.ok) throw new Error("Reverse geocoding failed");
        const data = await response.json();
        const address = [data.localityInfo?.administrative?.[3]?.name, data.locality, data.principalSubdivision]
          .filter(Boolean)
          .join(", ");

        setDeliveryAddress((current) => ({
          ...current,
          address: address || data.city || data.locality || "",
          city: data.city || data.locality || current.city,
          state: data.principalSubdivision || current.state,
          pincode: data.postcode || current.pincode,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      } catch {
        setLocationError("We found your location but could not read its address. Please enter the address manually.");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      setLocationError("We could not access your location. Please allow access or enter your address manually.");
    }, { enableHighAccuracy: true, timeout: 10000 });
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
                        src={resolveImageUrl(item.imageUrl)}
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
                          src={resolveImageUrl(item.imageUrl)}
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

            <div className="coupon-section">
              <div className="payment-method-heading">
                <h4>Coupon or discount</h4>
                <span>Apply a valid offer to this cart</span>
              </div>
              {appliedCoupon ? (
                <div className="applied-coupon">
                  <strong>{appliedCoupon.couponCode}</strong>
                  <span>− {formatMoney(appliedCoupon.discountAmount)}</span>
                  <button type="button" onClick={removeCoupon} disabled={isProcessing}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter coupon code" disabled={isProcessing || isApplyingCoupon} />
                  <button type="button" onClick={applyCoupon} disabled={isProcessing || isApplyingCoupon}>{isApplyingCoupon ? "Checking..." : "Apply"}</button>
                </div>
              )}
              {couponError && <p className="location-error">{couponError}</p>}
            </div>

            <div className="delivery-address-section">
              <div className="payment-method-heading">
                <h4>Delivery Address</h4>
                <span>Where should we deliver this order?</span>
              </div>
              <button type="button" className="location-button" onClick={useCurrentLocation} disabled={isLocating || isProcessing}>
                {isLocating ? "Detecting location..." : "Use My Current Location"}
              </button>
              {locationError && <p className="location-error">{locationError}</p>}
              <div className="delivery-address-fields">
                <label className="full-width">Full address<textarea value={deliveryAddress.address} onChange={(event) => updateAddress("address", event.target.value)} placeholder="House, hostel, or street address" rows="2" required /></label>
                <label>City<input value={deliveryAddress.city} onChange={(event) => updateAddress("city", event.target.value)} required /></label>
                <label>State<input value={deliveryAddress.state} onChange={(event) => updateAddress("state", event.target.value)} required /></label>
                <label>Pincode<input value={deliveryAddress.pincode} onChange={(event) => updateAddress("pincode", event.target.value)} inputMode="numeric" pattern="[0-9]{4,10}" required /></label>
              </div>
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

              {discountAmount > 0 && <div>
                <span>Coupon discount</span>
                <strong>− {formatMoney(discountAmount)}</strong>
              </div>}

              <div className="checkout-grand-total">
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatMoney(checkoutTotal)}
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
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import apiClient from "../apiClient";

const API_BASE = "http://localhost:8080/api";

const TRACKING_STEPS = [
  { status: "PENDING", label: "Placed", icon: "✓" },
  { status: "ACCEPTED", label: "Accepted", icon: "✓" },
  { status: "PROCESSING", label: "Processing", icon: "⚙" },
  { status: "SHIPPED", label: "Shipped", icon: "🚚" },
  { status: "DELIVERED", label: "Delivered", icon: "✓" },
];

function Orders({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = currentUser?.id;

  // =====================================================
  // FETCH ORDERS + PRODUCTS
  // =====================================================

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Please login to view your orders.");
      return;
    }

    try {
      setError("");

      const [ordersResponse, productsResponse] = await Promise.all([
        apiClient.get(`/orders/user/${userId}`),
        axios.get(`${API_BASE}/products`),
      ]);

      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : []
      );

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : []
      );
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, fetchData]);

  // =====================================================
  // FIND PRODUCT
  // =====================================================

  const getProduct = (productId) => {
    return products.find(
      (product) => Number(product.id) === Number(productId)
    );
  };

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();

    // COMPLETED is treated as final delivery
    if (normalized === "COMPLETED") {
      return "DELIVERED";
    }

    return normalized;
  };

  // =====================================================
  // STATUS MESSAGE
  // =====================================================

  const getStatusMessage = (status) => {
    switch (status) {
      case "PENDING":
        return "Order placed — waiting for seller";

      case "ACCEPTED":
        return "Order accepted by seller";

      case "PROCESSING":
        return "Seller is preparing your order";

      case "SHIPPED":
        return "Your order has been shipped";

      case "DELIVERED":
        return "Order delivered successfully";

      case "COMPLETED":
        return "Order completed successfully";

      default:
        return "Order status updated";
    }
  };

  // =====================================================
  // STEP CLASS
  // =====================================================

  const getStepClass = (currentStatus, stepStatus) => {
    const normalizedStatus = normalizeStatus(currentStatus);

    const currentIndex = TRACKING_STEPS.findIndex(
      (step) => step.status === normalizedStatus
    );

    const stepIndex = TRACKING_STEPS.findIndex(
      (step) => step.status === stepStatus
    );

    if (currentIndex === -1 || stepIndex === -1) {
      return "";
    }

    if (stepIndex < currentIndex) {
      return "done";
    }

    if (stepIndex === currentIndex) {
      return "active";
    }

    return "";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="orders-section">
        <div className="orders-header">
          <p className="section-tag">PURCHASE HISTORY</p>
          <h2>My Orders</h2>
        </div>

        <div className="loading">
          Loading orders...
        </div>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <section className="orders-section">
        <div className="orders-header">
          <p className="section-tag">PURCHASE HISTORY</p>
          <h2>My Orders</h2>
        </div>

        <div className="empty">
          <h3>{error}</h3>
          <button onClick={fetchData}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <section className="orders-section">

      <div className="orders-header">
        <p className="section-tag">
          PURCHASE HISTORY
        </p>

        <h2>My Orders</h2>

        <p className="orders-subtitle">
          Track your orders and delivery status
        </p>
      </div>

      {orders.length === 0 ? (

        <div className="empty">
          <div className="empty-cart-icon">
            📦
          </div>

          <h3>No orders yet</h3>

          <p>
            Your orders will appear here after
            you place an order.
          </p>
        </div>

      ) : (

        <div className="orders-list">

          {orders.map((order) => {

            const originalStatus = String(
              order.status || "PENDING"
            ).toUpperCase();

            const status = normalizeStatus(
              originalStatus
            );

            const product = getProduct(
              order.productId
            );

            return (

              <div
                className="order-card"
                key={order.id}
              >

                {/* =================================
                    ORDER HEADER
                ================================= */}

                <div className="order-top">

                  <div>
                    <p className="order-label">
                      ORDER ID
                    </p>

                    <h3>
                      #{order.id}
                    </h3>
                  </div>

                  <span
                    className={`status ${status.toLowerCase()}`}
                  >
                    {originalStatus}
                  </span>

                </div>


                {/* =================================
                    PRODUCT INFORMATION
                ================================= */}

                <div className="product-info">

                  <div className="product-main-info">

                    <p className="product-label">
                      PRODUCT
                    </p>

                    <h3>
                      {product?.productName ||
                        `Product #${order.productId}`}
                    </h3>

                    {product?.category && (
                      <span className="product-category">
                        {product.category?.name || "General"}
                      </span>
                    )}

                    {product?.description && (
                      <p className="product-description">
                        {product.description}
                      </p>
                    )}

                    {!product && (
                      <p className="product-description">
                        Product details are no longer
                        available.
                      </p>
                    )}

                  </div>


                  {/* =================================
                      ORDER DETAILS
                  ================================= */}

                  <div className="order-details">

                    <div>
                      <span>
                        Unit Price
                      </span>

                      <strong>
                        {product?.price != null
                          ? `₹${Number(
                              product.price
                            ).toLocaleString("en-IN")}`
                          : "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Quantity
                      </span>

                      <strong>
                        {order.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.totalPrice || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* =================================
                    ORDER TRACKING
                ================================= */}

                <div className="order-tracking">

                  <div className="tracking-header">

                    <strong>
                      Order Tracking
                    </strong>

                    <span className="tracking-status">
                      {originalStatus}
                    </span>

                  </div>

                  <p className="tracking-message">
                    {getStatusMessage(originalStatus)}
                  </p>


                  <div className="tracking-steps">

                    {TRACKING_STEPS.map(
                      (step, index) => {

                        const stepClass =
                          getStepClass(
                            originalStatus,
                            step.status
                          );

                        return (

                          <div
                            key={step.status}
                            className={`tracking-step ${stepClass}`}
                          >

                            <div className="step-circle">
                              {stepClass === "done"
                                ? "✓"
                                : stepClass === "active"
                                ? step.icon
                                : index + 1}
                            </div>

                            <span>
                              {step.label}
                            </span>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </section>
  );
}

export default Orders;
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function Orders({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("Please login to view your orders.");
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`${API_BASE}/orders/user/${userId}`),
      axios.get(`${API_BASE}/products`),
    ])
      .then(([ordersResponse, productsResponse]) => {
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
      })
      .catch((err) => {
        console.error("Error fetching orders/products:", err);
        setError("Unable to load your orders.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const getProductName = (productId) => {
    const product = products.find(
      (item) => Number(item.id) === Number(productId)
    );

    return product?.productName || `Product #${productId}`;
  };

  const getStatusClass = (status) => {
    return String(status || "PENDING")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const getStatusMessage = (status) => {
    switch (String(status || "").toUpperCase()) {
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
        return "Order completed";
      default:
        return "Order status updated";
    }
  };

  const isAtLeast = (status, states) => {
    return states.includes(status);
  };

  return (
    <section className="orders-section">
      <div className="orders-header">
        <p className="section-tag">PURCHASE HISTORY</p>
        <h2>My Orders</h2>
      </div>

      {loading ? (
        <p className="loading">Loading orders...</p>
      ) : error ? (
        <div className="empty">
          <h3>{error}</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-cart-icon">📦</div>
          <h3>No orders yet</h3>
          <p>
            Your orders will appear here after you place an order.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = String(
              order.status || "PENDING"
            ).toUpperCase();

            return (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <div>
                    <p className="order-label">ORDER ID</p>
                    <h3>#{order.id}</h3>
                  </div>

                  <span
                    className={`status ${getStatusClass(status)}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="order-details">
                  <div>
                    <span>Product</span>
                    <strong>
                      {getProductName(order.productId)}
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>{order.quantity}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      ₹
                      {Number(
                        order.totalPrice || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="order-tracking">
                  <strong>Tracking</strong>

                  <p>{getStatusMessage(status)}</p>

                  <div className="tracking-steps">
                    <span
                      className={
                        isAtLeast(
                          status,
                          [
                            "PENDING",
                            "ACCEPTED",
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED",
                            "COMPLETED",
                          ]
                        )
                          ? "done"
                          : ""
                      }
                    >
                      1. Placed
                    </span>

                    <span
                      className={
                        isAtLeast(
                          status,
                          [
                            "ACCEPTED",
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED",
                            "COMPLETED",
                          ]
                        )
                          ? "done"
                          : ""
                      }
                    >
                      2. Accepted
                    </span>

                    <span
                      className={
                        isAtLeast(
                          status,
                          [
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED",
                            "COMPLETED",
                          ]
                        )
                          ? "done"
                          : ""
                      }
                    >
                      3. Processing
                    </span>

                    <span
                      className={
                        isAtLeast(
                          status,
                          [
                            "SHIPPED",
                            "DELIVERED",
                            "COMPLETED",
                          ]
                        )
                          ? "done"
                          : ""
                      }
                    >
                      4. Shipped
                    </span>

                    <span
                      className={
                        isAtLeast(
                          status,
                          ["DELIVERED", "COMPLETED"]
                        )
                          ? "done"
                          : ""
                      }
                    >
                      5. Delivered
                    </span>
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
import { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";
function Orders({ currentUser }) {
  const [orders, setOrders] = useState([]);
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

    axios
      .get(`http://localhost:8080/api/orders/user/${userId}`)
      .then((response) => {
        setOrders(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Unable to load your orders.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

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
            const status = String(order.status || "PENDING").toUpperCase();

            return (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <div>
                    <p className="order-label">ORDER ID</p>
                    <h3>#{order.id}</h3>
                  </div>

                  <span className={`status ${getStatusClass(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="order-details">
                  <div>
                    <span>Product ID</span>
                    <strong>{order.productId}</strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>{order.quantity}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="order-tracking">
                  <strong>Tracking</strong>
                  <p>{getStatusMessage(status)}</p>

                  <div className="tracking-steps">
                    <span className={status !== "PENDING" ? "done" : "active"}>
                      1. Placed
                    </span>

                    <span
                      className={
                        ["ACCEPTED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"]
                          .includes(status)
                          ? "done"
                          : ""
                      }
                    >
                      2. Accepted
                    </span>

                    <span
                      className={
                        ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"].includes(
                          status
                        )
                          ? "done"
                          : ""
                      }
                    >
                      3. Processing
                    </span>

                    <span
                      className={
                        ["SHIPPED", "DELIVERED", "COMPLETED"].includes(status)
                          ? "done"
                          : ""
                      }
                    >
                      4. Shipped
                    </span>

                    <span
                      className={
                        ["DELIVERED", "COMPLETED"].includes(status)
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
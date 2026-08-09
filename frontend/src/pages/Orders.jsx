import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // MVP user ID
  const userId = 1;

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/orders/user/${userId}`)
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  return (
    <section className="orders-section">

      <div className="orders-header">
        <p className="section-tag">PURCHASE HISTORY</p>
        <h2>My Orders</h2>
      </div>

      {loading ? (
        <p className="loading">Loading orders...</p>
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

          {orders.map((order) => (
            <div className="order-card" key={order.id}>

              <div className="order-top">
                <div>
                  <p className="order-label">ORDER ID</p>
                  <h3>#{order.id}</h3>
                </div>

                <span
                  className={`status ${order.status.toLowerCase()}`}
                >
                  {order.status}
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
                    ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                  </strong>
                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default Orders;
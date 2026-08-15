import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";

function SellerDashboard({ currentUser, onLogout }) {
  const sellerId = currentUser?.id;

  // =========================
  // STATE
  // =========================

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [productLoading, setProductLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    productName: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });

  // =========================
  // LOAD PRODUCTS
  // =========================

  const loadProducts = async () => {
    if (!sellerId) return;

    try {
      setLoadingProducts(true);

      const response = await fetch(
        `${API_BASE}/products/seller/${sellerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    if (!sellerId) return;

    try {
      setLoadingOrders(true);

      const response = await fetch(
        `${API_BASE}/orders/seller/${sellerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load customer orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [sellerId]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setProductForm({
      productName: "",
      category: "",
      price: "",
      quantity: "",
      description: "",
    });

    setEditingProduct(null);
  };

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!sellerId) {
      setError("Seller information is missing. Please login again.");
      return;
    }

    if (
      !productForm.productName.trim() ||
      !productForm.category.trim() ||
      !productForm.price ||
      !productForm.quantity
    ) {
      setError("Please fill all required product fields.");
      return;
    }

    if (Number(productForm.price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (Number(productForm.quantity) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setProductLoading(true);

      const response = await fetch(
        `${API_BASE}/products/seller/${sellerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: productForm.productName.trim(),
            category: productForm.category.trim(),
            price: Number(productForm.price),
            quantity: Number(productForm.quantity),
            description: productForm.description.trim(),
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to add product");
      }

      await response.json();

      setMessage("Product added successfully.");
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to add product.");
    } finally {
      setProductLoading(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const handleEditClick = (product) => {
    setEditingProduct(product);

    setProductForm({
      productName: product.productName || "",
      category: product.category || "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      description: product.description || "",
    });

    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) return;

    setMessage("");
    setError("");

    try {
      setProductLoading(true);

      const response = await fetch(
        `${API_BASE}/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: productForm.productName.trim(),
            category: productForm.category.trim(),
            price: Number(productForm.price),
            quantity: Number(productForm.quantity),
            description: productForm.description.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      await response.json();

      setMessage("Product updated successfully.");
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to update product.");
    } finally {
      setProductLoading(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setMessage("Product deleted successfully.");

      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(
        "Unable to delete this product. It may already have orders."
      );
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const handleOrderStatus = async (order, newStatus) => {
    setMessage("");
    setError("");

    try {
      setOrderLoading(true);

      const response = await fetch(
        `${API_BASE}/orders/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: order.userId,
            productId: order.productId,
            quantity: order.quantity,
            totalPrice: order.totalPrice,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      await response.json();

      setMessage(`Order #${order.id} moved to ${newStatus}.`);

      await loadOrders();
    } catch (err) {
      console.error(err);
      setError("Unable to update order status.");
    } finally {
      setOrderLoading(false);
    }
  };

  // =========================
  // STATISTICS
  // =========================

  const totalProducts = products.length;

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      String(order.status || "").toUpperCase() === "PENDING"
  ).length;

  const totalSales = orders.reduce(
    (total, order) => total + Number(order.totalPrice || 0),
    0
  );

  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity || 0) <= 5
  ).length;

  // =========================
  // PRODUCT MAP
  // =========================

  const productMap = useMemo(() => {
    const map = {};

    products.forEach((product) => {
      map[product.id] = product;
    });

    return map;
  }, [products]);

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // =========================
  // STATUS CLASS
  // =========================

  const statusClass = (status) => {
    return String(status || "PENDING")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================
  // NEXT ORDER STATUS
  // =========================

  const getNextStatus = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "ACCEPTED";

      case "ACCEPTED":
        return "PROCESSING";

      case "PROCESSING":
        return "SHIPPED";

      case "SHIPPED":
        return "DELIVERED";

      default:
        return null;
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="seller-dashboard">

      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <header className="seller-navbar">

        <div className="seller-brand">
          <div className="brand-icon">🛍️</div>

          <div>
            <div className="brand-name">CampusKart</div>
            <div className="brand-subtitle">
              Campus Marketplace
            </div>
          </div>
        </div>

        <div className="navbar-title">
          Seller Dashboard
        </div>

        <div className="seller-profile">

          <div className="profile-avatar">
            {currentUser?.fullName
              ? currentUser.fullName.charAt(0).toUpperCase()
              : "S"}
          </div>

          <div className="profile-info">
            <strong>
              {currentUser?.fullName || "Campus Seller"}
            </strong>

            <span>SELLER</span>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="seller-main">

        {/* PAGE INTRO */}

        <section className="seller-intro">

          <div>
            <span className="eyebrow">
              SELLER PANEL
            </span>

            <h1>
              Welcome,{" "}
              {currentUser?.fullName || "Campus Seller"}
            </h1>

            <p>
              Manage your CampusKart products and customer
              orders from one place.
            </p>
          </div>

          <div className="seller-id">
            Seller ID: #{sellerId || "—"}
          </div>

        </section>

        {/* =================================================
            MESSAGES
        ================================================== */}

        {message && (
          <div className="alert success-alert">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="alert error-alert">
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================== */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">📦</div>

            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">🛒</div>

            <div>
              <span>Customer Orders</span>
              <strong>{totalOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">₹</div>

            <div>
              <span>Total Sales</span>
              <strong>{formatMoney(totalSales)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>

            <div>
              <span>Pending Orders</span>
              <strong>{pendingOrders}</strong>
            </div>
          </div>

        </section>

        {/* =================================================
            EXTRA STATS
        ================================================== */}

        <section className="mini-stats">

          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
          </div>

          <div>
            <span>Low Stock Items</span>
            <strong>{lowStockProducts}</strong>
          </div>

          <div>
            <span>Seller Status</span>
            <strong className="online">
              ● Online
            </strong>
          </div>

        </section>

        {/* =================================================
            ADD / EDIT PRODUCT
        ================================================== */}

        <section className="dashboard-card">

          <div className="section-heading">

            <div>
              <span className="section-label">
                PRODUCT MANAGEMENT
              </span>

              <h2>
                {editingProduct
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {editingProduct
                  ? "Update your product information."
                  : "List a new product on CampusKart."}
              </p>
            </div>

            {editingProduct && (
              <button
                className="secondary-button"
                onClick={resetForm}
                type="button"
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            className="product-form"
            onSubmit={
              editingProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
          >

            <div className="form-grid">

              <div className="form-group">
                <label>Product Name *</label>

                <input
                  type="text"
                  name="productName"
                  value={productForm.productName}
                  onChange={handleChange}
                  placeholder="Example: Wireless Mouse"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>

                <input
                  type="text"
                  name="category"
                  value={productForm.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price *</label>

                <div className="input-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleChange}
                    placeholder="799"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>

                <input
                  type="number"
                  name="quantity"
                  value={productForm.quantity}
                  onChange={handleChange}
                  placeholder="20"
                  min="0"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Product Description</label>

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows="4"
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={productLoading}
              >
                {productLoading
                  ? "Saving..."
                  : editingProduct
                  ? "✓ Update Product"
                  : "+ Add Product"}
              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            MY PRODUCTS
        ================================================== */}

        <section className="dashboard-card">

          <div className="section-heading">

            <div>
              <span className="section-label">
                INVENTORY
              </span>

              <h2>My Products</h2>

              <p>
                Products added by your seller account.
              </p>
            </div>

            <div className="count-badge">
              {products.length} Products
            </div>

          </div>

          {loadingProducts ? (
            <div className="loading-box">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="empty-box">
              <div>📦</div>
              <h3>No products yet</h3>
              <p>
                Add your first product using the form above.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {products.map((product) => {

                    const stock = Number(
                      product.quantity || 0
                    );

                    return (
                      <tr key={product.id}>

                        <td>
                          <div className="product-cell">

                            <div className="product-avatar">
                              🛍️
                            </div>

                            <div>
                              <strong>
                                {product.productName}
                              </strong>

                              <span>
                                ID #{product.id}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="category-badge">
                            {product.category || "General"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatMoney(product.price)}
                          </strong>
                        </td>

                        <td>
                          <strong
                            className={
                              stock <= 5
                                ? "low-stock"
                                : "normal-stock"
                            }
                          >
                            {stock}
                          </strong>
                        </td>

                        <td>

                          {stock === 0 ? (
                            <span className="status-pill out">
                              Out of Stock
                            </span>
                          ) : stock <= 5 ? (
                            <span className="status-pill warning">
                              Low Stock
                            </span>
                          ) : (
                            <span className="status-pill active">
                              In Stock
                            </span>
                          )}

                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEditClick(product)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDeleteProduct(
                                  product.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =================================================
            CUSTOMER ORDERS
        ================================================== */}

        <section className="dashboard-card">

          <div className="section-heading">

            <div>
              <span className="section-label">
                ORDER MANAGEMENT
              </span>

              <h2>Customer Orders</h2>

              <p>
                Orders placed for your products.
              </p>
            </div>

            <div className="count-badge">
              {orders.length} Orders
            </div>

          </div>

          {loadingOrders ? (
            <div className="loading-box">
              Loading customer orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-box">
              <div>🛒</div>
              <h3>No orders yet</h3>
              <p>
                Customer orders for your products will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="data-table orders-table">

                <thead>

                  <tr>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCT</th>
                    <th>QTY</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>

                </thead>

                <tbody>

                  {orders.map((order) => {

                    const product =
                      productMap[order.productId];

                    const nextStatus =
                      getNextStatus(order.status);

                    return (
                      <tr key={order.id}>

                        <td>
                          <strong className="order-id">
                            #{order.id}
                          </strong>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              👤
                            </div>

                            <div>
                              <strong>
                                Customer #{order.userId}
                              </strong>

                              <span>
                                User ID {order.userId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="order-product">

                            <strong>
                              {product?.productName ||
                                `Product #${order.productId}`}
                            </strong>

                            <span>
                              Product ID #{order.productId}
                            </span>

                          </div>
                        </td>

                        <td>
                          <strong>
                            {order.quantity}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {formatMoney(order.totalPrice)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-pill ${statusClass(
                              order.status
                            )}`}
                          >
                            {order.status || "PENDING"}
                          </span>
                        </td>

                        <td>

                          {nextStatus ? (
                            <button
                              className="accept-button"
                              disabled={orderLoading}
                              onClick={() =>
                                handleOrderStatus(
                                  order,
                                  nextStatus
                                )
                              }
                            >
                              {order.status === "PENDING"
                                ? "Accept Order"
                                : `Mark ${nextStatus}`}
                            </button>
                          ) : (
                            <span className="completed-label">
                              ✓ Completed
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .seller-dashboard {
          min-height: 100vh;
          width: 100%;
          background: #f5f7fb;
          color: #172033;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .seller-navbar {
          width: 100%;
          min-height: 76px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 42px;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
        }

        .seller-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 220px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
          color: #172033;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .navbar-title {
          font-size: 15px;
          font-weight: 700;
          color: #64748b;
        }

        .seller-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
          justify-content: flex-end;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          min-width: 90px;
        }

        .profile-info strong {
          font-size: 13px;
          color: #172033;
        }

        .profile-info span {
          font-size: 10px;
          color: #2563eb;
          font-weight: 800;
          margin-top: 2px;
        }

        .logout-button {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          padding: 9px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
        }

        .logout-button:hover {
          background: #f8fafc;
          color: #dc2626;
          border-color: #fecaca;
        }

        .seller-main {
          width: min(1440px, calc(100% - 64px));
          margin: 0 auto;
          padding: 38px 0 70px;
        }

        .seller-intro {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 24px;
        }

        .eyebrow,
        .section-label {
          color: #2563eb;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .seller-intro h1 {
          font-size: clamp(26px, 3vw, 38px);
          margin: 8px 0 6px;
          letter-spacing: -0.04em;
        }

        .seller-intro p {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }

        .seller-id {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
        }

        .alert {
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 18px;
          font-size: 13px;
          font-weight: 600;
        }

        .success-alert {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.035);
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 900;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-card span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .stat-card strong {
          font-size: 23px;
          color: #172033;
        }

        .mini-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .mini-stats > div {
          padding: 14px 20px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .mini-stats > div:last-child {
          border-right: none;
        }

        .mini-stats span {
          color: #64748b;
          font-size: 12px;
        }

        .mini-stats strong {
          font-size: 13px;
        }

        .online {
          color: #16a34a;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 24px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.035);
        }

        .section-heading {
          padding: 24px 26px 18px;
          border-bottom: 1px solid #eef2f7;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .section-heading h2 {
          margin: 5px 0 5px;
          font-size: 20px;
          letter-spacing: -0.02em;
        }

        .section-heading p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .count-badge {
          background: #eff6ff;
          color: #2563eb;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .product-form {
          padding: 24px 26px 26px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          border: 1px solid #dbe2ea;
          background: #fbfdff;
          border-radius: 9px;
          padding: 12px 13px;
          font-size: 13px;
          color: #172033;
          outline: none;
          transition: 0.2s ease;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 105px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #60a5fa;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }

        .input-prefix {
          display: flex;
          align-items: center;
          border: 1px solid #dbe2ea;
          background: #fbfdff;
          border-radius: 9px;
          overflow: hidden;
        }

        .input-prefix span {
          padding-left: 13px;
          font-weight: 800;
          color: #64748b;
        }

        .input-prefix input {
          border: none;
          box-shadow: none;
          background: transparent;
        }

        .input-prefix input:focus {
          box-shadow: none;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .primary-button {
          border: none;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(37, 99, 235, 0.18);
        }

        .primary-button:hover {
          transform: translateY(-1px);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          padding: 9px 13px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .data-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-align: left;
          padding: 13px 18px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .data-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #eef2f7;
          font-size: 12px;
          vertical-align: middle;
        }

        .data-table tbody tr:hover {
          background: #fbfdff;
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .product-cell,
        .customer-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .product-avatar,
        .customer-avatar {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          font-size: 17px;
        }

        .customer-avatar {
          background: #f5f3ff;
        }

        .product-cell strong,
        .customer-cell strong,
        .order-product strong {
          display: block;
          color: #172033;
          font-size: 12px;
        }

        .product-cell span,
        .customer-cell span,
        .order-product span {
          display: block;
          color: #94a3b8;
          font-size: 10px;
          margin-top: 3px;
        }

        .category-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 6px 9px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
        }

        .low-stock {
          color: #dc2626;
        }

        .normal-stock {
          color: #15803d;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .status-pill.active,
        .status-pill.accepted,
        .status-pill.processing {
          background: #ecfdf5;
          color: #15803d;
        }

        .status-pill.warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-pill.out {
          background: #fef2f2;
          color: #dc2626;
        }

        .status-pill.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-pill.shipped {
          background: #eff6ff;
          color: #2563eb;
        }

        .status-pill.delivered {
          background: #ecfdf5;
          color: #15803d;
        }

        .action-buttons {
          display: flex;
          gap: 7px;
        }

        .edit-button,
        .delete-button,
        .accept-button {
          border: none;
          border-radius: 7px;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .edit-button {
          background: #eff6ff;
          color: #2563eb;
        }

        .edit-button:hover {
          background: #dbeafe;
        }

        .delete-button {
          background: #fef2f2;
          color: #dc2626;
        }

        .delete-button:hover {
          background: #fee2e2;
        }

        .accept-button {
          background: #2563eb;
          color: #ffffff;
        }

        .accept-button:hover {
          background: #1d4ed8;
        }

        .accept-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .order-id {
          color: #2563eb;
        }

        .completed-label {
          color: #16a34a;
          font-size: 10px;
          font-weight: 900;
        }

        .loading-box,
        .empty-box {
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-box > div {
          font-size: 35px;
          margin-bottom: 10px;
        }

        .empty-box h3 {
          color: #334155;
          margin: 0 0 5px;
          font-size: 15px;
        }

        .empty-box p {
          margin: 0;
          font-size: 12px;
        }

        @media (max-width: 1000px) {

          .seller-navbar {
            padding: 0 22px;
          }

          .navbar-title {
            display: none;
          }

          .seller-main {
            width: min(100% - 36px, 900px);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 700px) {

          .seller-navbar {
            padding: 12px 16px;
            min-height: auto;
            gap: 10px;
          }

          .seller-brand {
            min-width: auto;
          }

          .brand-subtitle {
            display: none;
          }

          .profile-info {
            display: none;
          }

          .seller-profile {
            min-width: auto;
          }

          .seller-main {
            width: calc(100% - 24px);
            padding-top: 24px;
          }

          .seller-intro {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .mini-stats {
            grid-template-columns: 1fr;
          }

          .mini-stats > div {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }

          .mini-stats > div:last-child {
            border-bottom: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: auto;
          }

          .section-heading {
            padding: 20px;
          }

          .product-form {
            padding: 20px;
          }

          .section-heading {
            flex-direction: column;
          }

          .count-badge {
            align-self: flex-start;
          }

        }

      `}</style>

    </div>
  );
}

export default SellerDashboard;
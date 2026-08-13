import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard({ currentUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [activeSection, setActiveSection] = useState("overview");

  // =========================
  // LOAD PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // LOAD USERS
  // =========================

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/users"
      );

      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadProducts();
    loadUsers();
  }, []);

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/products/${id}`
      );

      alert("Product deleted successfully!");

      loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      alert("Failed to delete product.");
    }
  };

  // =========================
  // COUNTS
  // =========================

  const totalProducts = products.length;

  const totalUsers = users.length;

  const totalSellers = users.filter(
    (user) => user.role === "SELLER"
  ).length;

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="admin-dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          Campus<span>Kart</span>
        </div>

        <p className="admin-panel-label">
          ADMIN PANEL
        </p>

        <nav>

          <button
            className={
              activeSection === "overview"
                ? "admin-nav active"
                : "admin-nav"
            }
            onClick={() => setActiveSection("overview")}
          >
            📊 Overview
          </button>

          <button
            className={
              activeSection === "users"
                ? "admin-nav active"
                : "admin-nav"
            }
            onClick={() => setActiveSection("users")}
          >
            👥 Users
          </button>

          <button
            className={
              activeSection === "products"
                ? "admin-nav active"
                : "admin-nav"
            }
            onClick={() => setActiveSection("products")}
          >
            📦 Products
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-user-mini">
            <div className="admin-avatar">
              👑
            </div>

            <div>
              <strong>
                {currentUser?.fullName || "Admin"}
              </strong>

              <small>
                Administrator
              </small>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={onLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="admin-main">

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div>
            <span className="admin-welcome-label">
              CAMPUSKART ADMINISTRATION
            </span>

            <h1>
              Welcome back,{" "}
              {currentUser?.fullName || "Admin"} 👋
            </h1>
          </div>

          <div className="admin-role-badge">
            👑 ADMIN
          </div>

        </header>

        {/* =========================
            OVERVIEW
        ========================= */}

        {activeSection === "overview" && (
          <section>

            <div className="admin-section-title">
              <div>
                <h2>Dashboard Overview</h2>

                <p>
                  Monitor your CampusKart marketplace.
                </p>
              </div>
            </div>

            {/* STAT CARDS */}

            <div className="admin-stat-grid">

              <div className="admin-stat-card">
                <div className="stat-icon purple">
                  👥
                </div>

                <div>
                  <span>Total Users</span>
                  <strong>{totalUsers}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon blue">
                  🏪
                </div>

                <div>
                  <span>Total Sellers</span>
                  <strong>{totalSellers}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon green">
                  🛍️
                </div>

                <div>
                  <span>Customers</span>
                  <strong>{totalCustomers}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon orange">
                  📦
                </div>

                <div>
                  <span>Total Products</span>
                  <strong>{totalProducts}</strong>
                </div>
              </div>

            </div>

            {/* QUICK INFORMATION */}

            <div className="admin-content-card">

              <div className="card-heading">
                <div>
                  <h3>Marketplace Summary</h3>

                  <p>
                    Current CampusKart platform statistics.
                  </p>
                </div>
              </div>

              <div className="summary-grid">

                <div className="summary-item">
                  <span>Registered Users</span>
                  <strong>{totalUsers}</strong>
                </div>

                <div className="summary-item">
                  <span>Active Sellers</span>
                  <strong>{totalSellers}</strong>
                </div>

                <div className="summary-item">
                  <span>Registered Customers</span>
                  <strong>{totalCustomers}</strong>
                </div>

                <div className="summary-item">
                  <span>Listed Products</span>
                  <strong>{totalProducts}</strong>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* =========================
            USERS
        ========================= */}

        {activeSection === "users" && (
          <section>

            <div className="admin-section-title">

              <div>
                <h2>User Management</h2>

                <p>
                  View CampusKart users and their roles.
                </p>
              </div>

            </div>

            <div className="admin-content-card">

              {loadingUsers ? (
                <p className="admin-loading">
                  Loading users...
                </p>
              ) : users.length === 0 ? (
                <p className="admin-empty">
                  No users found.
                </p>
              ) : (

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>

                    <tbody>

                      {users.map((user) => (

                        <tr key={user.id}>

                          <td>
                            #{user.id}
                          </td>

                          <td>
                            <strong>
                              {user.fullName}
                            </strong>
                          </td>

                          <td>
                            {user.email}
                          </td>

                          <td>

                            <span
                              className={`role-badge ${String(
                                user.role
                              ).toLowerCase()}`}
                            >
                              {user.role}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>
        )}

        {/* =========================
            PRODUCTS
        ========================= */}

        {activeSection === "products" && (
          <section>

            <div className="admin-section-title">

              <div>
                <h2>Product Management</h2>

                <p>
                  Manage products listed on CampusKart.
                </p>
              </div>

            </div>

            <div className="admin-content-card">

              {loadingProducts ? (
                <p className="admin-loading">
                  Loading products...
                </p>
              ) : products.length === 0 ? (
                <p className="admin-empty">
                  No products available.
                </p>
              ) : (

                <div className="admin-product-grid">

                  {products.map((product) => (

                    <div
                      className="admin-product-card"
                      key={product.id}
                    >

                      <div className="product-top">

                        <span className="product-category">
                          {product.category}
                        </span>

                        <span className="product-id">
                          #{product.id}
                        </span>

                      </div>

                      <h3>
                        {product.productName}
                      </h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="product-info">

                        <div>
                          <span>Price</span>

                          <strong>
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div>
                          <span>Stock</span>

                          <strong>
                            {product.quantity}
                          </strong>
                        </div>

                      </div>

                      <button
                        className="product-delete-btn"
                        onClick={() =>
                          handleDeleteProduct(product.id)
                        }
                      >
                        🗑️ Delete Product
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;
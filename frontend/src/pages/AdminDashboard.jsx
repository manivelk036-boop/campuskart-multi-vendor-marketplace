import { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../apiClient";
import "./AdminDashboard.css";

function AdminDashboard({ currentUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: "", discountType: "PERCENTAGE", discountValue: "",
    minimumOrderAmount: "0", maximumDiscountAmount: "", startAt: "", expiresAt: "", usageLimit: "", active: true,
  });

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
      const response = await apiClient.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await apiClient.get("/coupons");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadProducts(), loadUsers(), loadCoupons()]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
      await apiClient.delete(`/products/${id}`);

      alert("Product deleted successfully!");

      loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      alert("Failed to delete product.");
    }
  };

  const resetCouponForm = () => {
    setEditingCouponId(null);
    setCouponForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minimumOrderAmount: "0", maximumDiscountAmount: "", startAt: "", expiresAt: "", usageLimit: "", active: true });
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    const payload = {
      ...couponForm,
      discountValue: Number(couponForm.discountValue),
      minimumOrderAmount: Number(couponForm.minimumOrderAmount || 0),
      maximumDiscountAmount: couponForm.maximumDiscountAmount ? Number(couponForm.maximumDiscountAmount) : null,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
    };
    try {
      if (editingCouponId) await apiClient.put(`/coupons/${editingCouponId}`, payload);
      else await apiClient.post("/coupons", payload);
      resetCouponForm();
      await loadCoupons();
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data || "Unable to save coupon.");
    }
  };

  const editCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({ ...coupon, discountValue: String(coupon.discountValue), minimumOrderAmount: String(coupon.minimumOrderAmount), maximumDiscountAmount: coupon.maximumDiscountAmount == null ? "" : String(coupon.maximumDiscountAmount), usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit), startAt: coupon.startAt?.slice(0, 16), expiresAt: coupon.expiresAt?.slice(0, 16) });
    setActiveSection("coupons");
  };

  const toggleCoupon = async (coupon) => {
    await apiClient.patch(`/coupons/${coupon.id}/active`, { active: !coupon.active });
    await loadCoupons();
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await apiClient.delete(`/coupons/${id}`);
    await loadCoupons();
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
            className={activeSection === "coupons" ? "admin-nav active" : "admin-nav"}
            onClick={() => setActiveSection("coupons")}
          >
            🏷️ Coupons
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

        {activeSection === "coupons" && (
          <section>
            <div className="admin-section-title">
              <div><h2>Coupon Management</h2><p>Create discounts and control their availability.</p></div>
            </div>
            <div className="admin-content-card">
              <form className="coupon-admin-form" onSubmit={saveCoupon}>
                <input placeholder="Code" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} required />
                <select value={couponForm.discountType} onChange={(event) => setCouponForm({ ...couponForm, discountType: event.target.value })}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></select>
                <input type="number" min="0.01" step="0.01" placeholder="Discount value" value={couponForm.discountValue} onChange={(event) => setCouponForm({ ...couponForm, discountValue: event.target.value })} required />
                <input type="number" min="0" step="0.01" placeholder="Minimum order" value={couponForm.minimumOrderAmount} onChange={(event) => setCouponForm({ ...couponForm, minimumOrderAmount: event.target.value })} required />
                <input type="number" min="0" step="0.01" placeholder="Maximum discount (optional)" value={couponForm.maximumDiscountAmount} onChange={(event) => setCouponForm({ ...couponForm, maximumDiscountAmount: event.target.value })} />
                <input type="datetime-local" value={couponForm.startAt} onChange={(event) => setCouponForm({ ...couponForm, startAt: event.target.value })} required />
                <input type="datetime-local" value={couponForm.expiresAt} onChange={(event) => setCouponForm({ ...couponForm, expiresAt: event.target.value })} required />
                <input type="number" min="1" placeholder="Usage limit (optional)" value={couponForm.usageLimit} onChange={(event) => setCouponForm({ ...couponForm, usageLimit: event.target.value })} />
                <button type="submit">{editingCouponId ? "Update Coupon" : "Create Coupon"}</button>
                {editingCouponId && <button type="button" onClick={resetCouponForm}>Cancel</button>}
              </form>
              <div className="admin-table-wrapper">
                <table className="admin-table"><thead><tr><th>Code</th><th>Discount</th><th>Usage</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                  {coupons.map((coupon) => <tr key={coupon.id}><td><strong>{coupon.code}</strong></td><td>{coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td><td>{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td><td>{new Date(coupon.expiresAt).toLocaleString()}</td><td>{coupon.active ? "Active" : "Inactive"}</td><td><button onClick={() => editCoupon(coupon)}>Edit</button> <button onClick={() => toggleCoupon(coupon)}>{coupon.active ? "Deactivate" : "Activate"}</button> <button onClick={() => deleteCoupon(coupon.id)}>Delete</button></td></tr>)}
                </tbody></table>
              </div>
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
                          {product.category?.name || "General"}
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
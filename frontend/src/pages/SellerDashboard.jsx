import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "../apiClient";
import SellerReviews from "../components/SellerReviews";
import SellerAnalytics from "../components/SellerAnalytics";
import "./SellerDashboard.css";

function SellerDashboard({ currentUser, onLogout }) {
  const sellerId = currentUser?.id;
  const sellerName = currentUser?.fullName || "Campus Seller";
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ productName: "", category: "", price: "", quantity: "", description: "", imageUrl: "" });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    document.querySelectorAll(".product-form input[type=file]").forEach((input) => {
      input.multiple = true;
    });
  }, []);

  const loadProducts = useCallback(async () => {
    if (!sellerId) return;
    try {
      setLoadingProducts(true);
      const response = await apiClient.get(`/products/seller/${sellerId}`);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your products.");
    } finally {
      setLoadingProducts(false);
    }
  }, [sellerId]);

  const loadOrders = useCallback(async () => {
    if (!sellerId) return;
    try {
      setLoadingOrders(true);
      const response = await apiClient.get(`/orders/seller/${sellerId}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load customer orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [sellerId]);

  const loadAnalytics = useCallback(async () => {
    if (!sellerId) return;
    try {
      setLoadingAnalytics(true);
      setAnalyticsError("");
      const response = await apiClient.get("/seller/analytics/dashboard");
      setAnalytics(response.data || null);
    } catch (err) {
      console.error(err);
      setAnalyticsError("Unable to load seller analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [sellerId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void Promise.all([loadProducts(), loadOrders(), loadAnalytics()]), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProducts, loadOrders, loadAnalytics]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setProductForm({ productName: "", category: "", price: "", quantity: "", description: "", imageUrl: "" });
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImageFile(null);
    setSelectedImageFiles([]);
    setImagePreview("");
    setEditingProduct(null);
  };

  const uploadProductImage = async (productId, file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/products/${productId}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  };

  const uploadGalleryImages = async (productId, files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post(`/products/${productId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    }
  };

  const handleImageFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const file = files[0] ?? null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setSelectedImageFile(null);
      setSelectedImageFiles([]);
      setImagePreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      event.target.value = "";
      setSelectedImageFile(null);
      setSelectedImageFiles([]);
      setImagePreview("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file must be 5 MB or smaller.");
      event.target.value = "";
      setSelectedImageFile(null);
      setSelectedImageFiles([]);
      setImagePreview("");
      return;
    }
    setSelectedImageFile(file);
    setSelectedImageFiles(files);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!sellerId) {
      setError("Seller information is missing. Please login again.");
      return;
    }
    if (!productForm.productName.trim() || !productForm.category.trim() || !productForm.price || !productForm.quantity) {
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
      const response = await apiClient.post(`/products/seller/${sellerId}`, { productName: productForm.productName.trim(), category: { name: productForm.category.trim() }, price: Number(productForm.price), quantity: Number(productForm.quantity), description: productForm.description.trim(), imageUrl: productForm.imageUrl?.trim() || "" });
      if (selectedImageFiles.length > 0 && response?.data?.id) {
        await uploadProductImage(response.data.id, selectedImageFiles[0]);
        if (selectedImageFiles.length > 1) await uploadGalleryImages(response.data.id, selectedImageFiles.slice(1));
      }
      setMessage("Product added successfully.");
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to add product.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProductForm({ productName: product.productName || "", category: product.category?.name || "", price: product.price ?? "", quantity: product.quantity ?? "", description: product.description || "", imageUrl: product.imageUrl || "" });
    setSelectedImageFile(null);
    setImagePreview("");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();
    if (!editingProduct) return;
    setMessage("");
    setError("");
    try {
      setProductLoading(true);
      await apiClient.put(`/products/${editingProduct.id}`, { productName: productForm.productName.trim(), category: { name: productForm.category.trim() }, price: Number(productForm.price), quantity: Number(productForm.quantity), description: productForm.description.trim(), imageUrl: productForm.imageUrl?.trim() || "" });
      if (selectedImageFiles.length > 0) {
        await uploadProductImage(editingProduct.id, selectedImageFiles[0]);
        if (selectedImageFiles.length > 1) await uploadGalleryImages(editingProduct.id, selectedImageFiles.slice(1));
      }
      setMessage("Product updated successfully.");
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to update product.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setMessage("");
    setError("");
    try {
      await apiClient.delete(`/products/${productId}`);
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Unable to delete this product. It may already have orders.");
    }
  };

  const handleOrderStatus = async (order, newStatus) => {
    setMessage("");
    setError("");
    try {
      setOrderLoading(true);
      const statusEndpoints = { ACCEPTED: "accept", REJECTED: "reject", PROCESSING: "process", READY: "ready", DELIVERED: "complete" };
      const endpoint = statusEndpoints[newStatus];
      if (!endpoint) throw new Error(`Unsupported order status: ${newStatus}`);
      await apiClient.put(`/orders/${order.id}/${endpoint}`);
      setMessage(`Order #${order.id} moved to ${newStatus}.`);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError("Unable to update order status.");
    } finally {
      setOrderLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));
  const statusClass = (status) => String(status || "PENDING").toLowerCase().replace(/\s+/g, "-");
  const getNextStatus = (status) => ({ PENDING: "ACCEPTED", ACCEPTED: "PROCESSING", PROCESSING: "READY", READY: "DELIVERED" })[String(status).toUpperCase()] || null;
  const orderStatus = (status) => String(status || "").toUpperCase();
  const productMap = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const filteredProducts = useMemo(() => {
    const query = dashboardSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => `${product.productName} ${product.category?.name || ""}`.toLowerCase().includes(query));
  }, [dashboardSearch, products]);
  const productSales = useMemo(() => orders.reduce((sales, order) => {
    if (["DELIVERED", "COMPLETED"].includes(orderStatus(order.status))) sales[order.productId] = (sales[order.productId] || 0) + Number(order.totalPrice || 0);
    return sales;
  }, {}), [orders]);
  const topProducts = useMemo(() => [...filteredProducts].sort((left, right) => (productSales[right.id] || 0) - (productSales[left.id] || 0)).slice(0, 4), [filteredProducts, productSales]);
  const pendingOrders = orders.filter((order) => orderStatus(order.status) === "PENDING").length;
  const readyOrders = orders.filter((order) => ["READY", "PROCESSING", "ACCEPTED"].includes(orderStatus(order.status))).length;
  const shippedOrders = orders.filter((order) => ["SHIPPED", "DELIVERED", "COMPLETED"].includes(orderStatus(order.status))).length;
  const deliveredOrders = orders.filter((order) => ["DELIVERED", "COMPLETED"].includes(orderStatus(order.status))).length;
  const totalSales = orders.filter((order) => ["DELIVERED", "COMPLETED"].includes(orderStatus(order.status))).reduce((total, order) => total + Number(order.totalPrice || 0), 0);
  const lowStockProducts = products.filter((product) => Number(product.quantity || 0) > 0 && Number(product.quantity || 0) <= 5).length;
  const outOfStockProducts = products.filter((product) => Number(product.quantity || 0) === 0).length;
  const inactiveProducts = products.filter((product) => product.active === false || product.isActive === false).length;
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  };
  const navigation = [["dashboard", "⌂", "Dashboard"], ["orders", "▣", "Orders", pendingOrders], ["products", "□", "Products"], ["inventory", "▤", "Inventory"], ["payments", "₹", "Payments"], ["customers", "♙", "Customers"], ["analytics", "◫", "Reports & Analytics"], ["promotions", "◇", "Promotions"], ["messages", "✉", "Messages"], ["help", "?", "Help & Support"]];

  return (
    <div className="seller-dashboard">
      <header className="seller-navbar"><button className="mobile-menu-button" type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle seller navigation">☰</button><button className="seller-brand" type="button" onClick={() => scrollToSection("dashboard")}><span className="brand-mark">CK</span><span><strong>CampusKart</strong><small>Seller Hub</small></span></button><label className="seller-search"><span>⌕</span><input value={dashboardSearch} onChange={(event) => setDashboardSearch(event.target.value)} placeholder="Search orders, products, or help..." aria-label="Search dashboard" /></label><div className="seller-profile"><button className="notification-button" type="button" aria-label="Notifications">♢<b>{pendingOrders || ""}</b></button><span className="profile-avatar">{sellerInitial}</span><span className="profile-copy"><strong>{sellerName}</strong><small>Seller account</small></span><span className="profile-chevron">⌄</span><button className="logout-button" type="button" onClick={onLogout}>Logout</button></div></header>
      <aside className={`seller-sidebar ${mobileNavOpen ? "is-open" : ""}`}><div className="sidebar-title">SELLER WORKSPACE</div><nav>{navigation.map(([id, icon, label, badge]) => <button className={id === "dashboard" ? "active" : ""} key={id} type="button" onClick={() => scrollToSection(id === "dashboard" ? "dashboard" : id === "orders" ? "orders" : id === "products" || id === "inventory" ? "products" : "dashboard")}><span className="nav-icon">{icon}</span><span>{label}</span>{badge ? <em>{badge}</em> : null}</button>)}</nav><div className="seller-status"><span className="status-dot" /><strong>Your Seller Status</strong><b>Active</b><p>Keep going! You&apos;re doing great.</p></div></aside>
      <main className="seller-main" id="dashboard">
        <section className="welcome-banner"><div><span className="eyebrow">OVERVIEW</span><h1>Welcome back, {sellerName}! <span aria-hidden="true">👋</span></h1><p>Manage your products, track orders and grow your business with CampusKart.</p></div><div className="welcome-art"><span>Sell. Support. Build.</span><strong>A Better Campus.</strong><i>✦</i></div></section>
        {message ? <div className="alert success-alert">✓ {message}</div> : null}{error ? <div className="alert error-alert">⚠ {error}</div> : null}
        <section className="stats-grid"><div className="stat-card pastel-blue"><span className="stat-icon">▣</span><div><small>Pending Orders</small><strong>{pendingOrders}</strong><em>Needs attention</em></div><b>↗</b></div><div className="stat-card pastel-yellow"><span className="stat-icon">◷</span><div><small>Ready to Ship</small><strong>{readyOrders}</strong><em>In your workflow</em></div><b>↗</b></div><div className="stat-card pastel-pink"><span className="stat-icon">↩</span><div><small>Returns</small><strong>--</strong><em>No return data</em></div><b>↗</b></div><div className="stat-card pastel-green"><span className="stat-icon">₹</span><div><small>Total Earnings</small><strong>{formatMoney(totalSales)}</strong><em>Completed orders</em></div><b>↗</b></div><div className="stat-card pastel-lilac"><span className="stat-icon">◉</span><div><small>Product Views</small><strong>--</strong><em>Analytics unavailable</em></div><b>↗</b></div></section>
        <SellerAnalytics analytics={analytics} loading={loadingAnalytics} error={analyticsError} formatMoney={formatMoney} />
        <section className="dashboard-grid"><article className="dashboard-card orders-summary" id="orders"><div className="card-heading"><div><span className="eyebrow">ORDER FLOW</span><h2>Today&apos;s Orders</h2></div><button className="text-link" type="button" onClick={() => scrollToSection("orders-table")}>Manage Orders →</button></div><div className="order-summary-list"><div><span className="summary-icon blue">+</span><span>New Orders</span><b>{pendingOrders}</b></div><div><span className="summary-icon yellow">◷</span><span>Ready to Ship</span><b>{readyOrders}</b></div><div><span className="summary-icon purple">↗</span><span>Shipped</span><b>{shippedOrders}</b></div><div><span className="summary-icon green">✓</span><span>Delivered</span><b>{deliveredOrders}</b></div></div></article><article className="dashboard-card inventory-card" id="inventory"><div className="card-heading"><div><span className="eyebrow">STOCK HEALTH</span><h2>Inventory Alerts</h2></div><button className="text-link" type="button" onClick={() => scrollToSection("products")}>Manage Inventory →</button></div><div className="inventory-list"><div><span className="summary-icon yellow">!</span><span>Low Stock</span><b>{lowStockProducts}</b></div><div><span className="summary-icon red">×</span><span>Out of Stock</span><b>{outOfStockProducts}</b></div><div><span className="summary-icon gray">−</span><span>Inactive Listings</span><b>{inactiveProducts}</b></div></div></article></section>
        <section className="dashboard-grid lower-grid"><article className="dashboard-card quick-actions"><div className="card-heading"><div><span className="eyebrow">SHORTCUTS</span><h2>Quick Actions</h2></div></div><div className="quick-action-list"><button type="button" onClick={() => scrollToSection("product-form")}><span>＋</span><b>Add Product</b><small>Create listing</small></button><button type="button" disabled><span>⇧</span><b>Bulk Upload</b><small>Coming soon</small></button><button type="button" onClick={() => scrollToSection("products")}><span>□</span><b>Manage Listings</b><small>View products</small></button><button type="button" disabled><span>₹</span><b>Update Prices</b><small>Coming soon</small></button></div></article><article className="dashboard-card payment-card" id="payments"><div className="card-heading"><div><span className="eyebrow">FINANCE</span><h2>Payment Overview</h2></div><span className="card-icon">₹</span></div>{deliveredOrders ? <div className="payment-value"><small>Completed order value</small><strong>{formatMoney(totalSales)}</strong><span>Based on delivered orders</span></div> : <div className="compact-empty"><span>₹</span><strong>Payment summary</strong><p>Payment details will appear here.</p></div>}</article><article className="dashboard-card feedback-card"><div className="card-heading"><div><span className="eyebrow">CUSTOMER VOICE</span><h2>Customer Feedback</h2></div><span className="card-icon">♡</span></div><div className="compact-empty"><span>♡</span><strong>No reviews yet.</strong><p>Customer feedback will appear here.</p></div></article></section>
        <section className="dashboard-grid insight-grid"><article className="dashboard-card tips-card"><div className="card-heading"><div><span className="eyebrow">SELLER TIPS</span><h2>Announcements &amp; Tips</h2></div></div><ul><li><span>✓</span>Keep your product stock updated</li><li><span>✓</span>Add clear product images</li><li><span>✓</span>Respond quickly to customer orders</li></ul></article><article className="grow-card"><div><span className="eyebrow">CAMPUSKART GROWTH</span><h2>Grow Your Campus Business 🚀</h2><p>List new products and reach more students across your campus.</p><button type="button" onClick={() => scrollToSection("product-form")}>Add New Product →</button></div><span className="grow-mark">↗</span></article></section>
        <section className="dashboard-card form-card" id="product-form"><div className="card-heading"><div><span className="eyebrow">PRODUCT MANAGEMENT</span><h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2><p>{editingProduct ? "Update your product information." : "List a new product on CampusKart."}</p></div>{editingProduct ? <button className="secondary-button" type="button" onClick={resetForm}>Cancel Edit</button> : null}</div><form className="product-form" onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}><div className="form-grid"><label>Product Name *<input type="text" name="productName" value={productForm.productName} onChange={handleChange} placeholder="Example: Wireless Mouse" required /></label><label>Category *<input type="text" name="category" value={productForm.category} onChange={handleChange} placeholder="Example: Electronics" required /></label><label>Price *<span className="input-prefix"><b>₹</b><input type="number" name="price" value={productForm.price} onChange={handleChange} placeholder="799" min="1" step="0.01" required /></span></label><label>Stock Quantity *<input type="number" name="quantity" value={productForm.quantity} onChange={handleChange} placeholder="20" min="0" required /></label><label className="full-width">Product Description<textarea name="description" value={productForm.description} onChange={handleChange} placeholder="Describe your product..." rows="4" /></label><label className="full-width">Product Image<div className="image-upload-row"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageFileChange} /><span>{selectedImageFile ? selectedImageFile.name : "No file selected"}</span></div>{imagePreview ? <div className="image-preview"><img src={imagePreview} alt="Selected product preview" /></div> : null}</label><label className="full-width">Image URL<input type="url" name="imageUrl" value={productForm.imageUrl} onChange={handleChange} placeholder="https://example.com/product.jpg" />{editingProduct?.imageUrl && !productForm.imageUrl && !selectedImageFile ? <div className="existing-image-preview"><img src={editingProduct.imageUrl} alt="Existing product preview" /></div> : null}</label></div><div className="form-actions"><button className="primary-button" type="submit" disabled={productLoading}>{productLoading ? "Saving..." : editingProduct ? "✓ Update Product" : "+ Add Product"}</button></div></form></section>
        <section className="dashboard-card" id="products"><div className="card-heading"><div><span className="eyebrow">CATALOG</span><h2>Top Performing Products</h2><p>Your active CampusKart listings, ranked by completed order value.</p></div><span className="count-badge">{products.length} Products</span></div>{loadingProducts ? <div className="loading-box">Loading products...</div> : products.length === 0 ? <div className="empty-box"><span>□</span><h3>No products yet</h3><p>Add your first product using the form above.</p></div> : <div className="top-products">{topProducts.map((product) => { const stock = Number(product.quantity || 0); return <div className="top-product" key={product.id}><div className="top-product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.productName} /> : <span>□</span>}</div><div className="top-product-info"><strong>{product.productName}</strong><small>{product.category?.name || "General"}</small><b>{formatMoney(product.price)}</b></div><div className="top-product-stock"><span className={`status-pill ${stock === 0 ? "out" : stock <= 5 ? "warning" : "active"}`}>{stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock"}</span><small>{stock} units</small></div><div className="action-buttons"><button className="edit-button" type="button" onClick={() => handleEditClick(product)}>Edit</button><button className="delete-button" type="button" onClick={() => handleDeleteProduct(product.id)}>Delete</button></div></div>; })}</div>}</section>
        <section className="dashboard-card orders-card" id="orders-table"><div className="card-heading"><div><span className="eyebrow">ORDER MANAGEMENT</span><h2>Customer Orders</h2><p>Orders placed for your products.</p></div><span className="count-badge">{orders.length} Orders</span></div>{loadingOrders ? <div className="loading-box">Loading customer orders...</div> : orders.length === 0 ? <div className="empty-box"><span>▣</span><h3>No orders yet</h3><p>Customer orders for your products will appear here.</p></div> : <div className="table-wrapper"><table className="data-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>QTY</th><th>TOTAL</th><th>DELIVERY ADDRESS</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{orders.map((order) => { const product = productMap[order.productId]; const nextStatus = getNextStatus(order.status); return <tr key={order.id}><td><strong className="order-id">#{order.id}</strong></td><td>Customer #{order.userId}</td><td>{product?.productName || `Product #${order.productId}`}</td><td>{order.quantity}</td><td><strong>{formatMoney(order.totalPrice)}</strong></td><td>{order.deliveryAddress ? `${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState} - ${order.deliveryPincode}` : "Not provided"}</td><td><span className={`status-pill ${statusClass(order.status)}`}>{order.status || "PENDING"}</span></td><td>{nextStatus ? <button className="accept-button" type="button" disabled={orderLoading} onClick={() => handleOrderStatus(order, nextStatus)}>{order.status === "PENDING" ? "Accept Order" : `Mark ${nextStatus}`}</button> : <span className="completed-label">✓ Completed</span>}</td></tr>; })}</tbody></table></div>}</section>
        <SellerReviews sellerId={sellerId} />
      </main>
    </div>
  );
}

export default SellerDashboard;
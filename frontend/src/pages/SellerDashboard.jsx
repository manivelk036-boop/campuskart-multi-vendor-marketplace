import { useEffect, useState } from "react";
import axios from "axios";
import "./SellerDashboard.css";

function SellerDashboard({ currentUser, onLogout }) {
  const [products, setProducts] = useState([]);

  // ADD FORM
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // EDIT
  const [editingProduct, setEditingProduct] = useState(null);

  // STATUS
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD SELLER PRODUCTS
  // =========================

  const loadProducts = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8080/api/products/seller/${currentUser.id}`
      );

      setProducts(response.data);
      setError("");
    } catch (err) {
      console.error("Load products error:", err);
      setError("Unable to load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentUser]);

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setProductName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setQuantity("");
  };

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !productName.trim() ||
      !category.trim() ||
      !description.trim() ||
      !price ||
      !quantity
    ) {
      setError("Please fill all product fields.");
      return;
    }

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      setError("Price and quantity must be greater than 0.");
      return;
    }

    const productData = {
      productName: productName.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      quantity: Number(quantity),
    };

    try {
      setSaving(true);
      setError("");

      console.log("Adding product:", productData);

      await axios.post(
        `http://localhost:8080/api/products/seller/${currentUser.id}`,
        productData
      );

      setMessage("Product added successfully! ✅");

      clearForm();

      await loadProducts();
    } catch (err) {
      console.error("Add product error:", err);

      setError(
        err.response?.data ||
          "Failed to add product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (product) => {
    setEditingProduct(product);

    setProductName(product.productName || "");
    setCategory(product.category || "");
    setDescription(product.description || "");
    setPrice(product.price || "");
    setQuantity(product.quantity || "");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    if (
      !productName.trim() ||
      !category.trim() ||
      !description.trim() ||
      !price ||
      !quantity
    ) {
      setError("Please fill all product fields.");
      return;
    }

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      setError("Price and quantity must be greater than 0.");
      return;
    }

    const updatedProduct = {
      productName: productName.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      quantity: Number(quantity),
    };

    try {
      setSaving(true);
      setError("");

      console.log(
        "Updating product:",
        editingProduct.id,
        updatedProduct
      );

      await axios.put(
        `http://localhost:8080/api/products/${editingProduct.id}`,
        updatedProduct
      );

      setMessage("Product updated successfully! ✅");

      setEditingProduct(null);

      clearForm();

      await loadProducts();
    } catch (err) {
      console.error("Update product error:", err);

      setError(
        err.response?.data ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingProduct(null);
    clearForm();
    setError("");
    setMessage("");
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await axios.delete(
        `http://localhost:8080/api/products/${id}`
      );

      setMessage("Product deleted successfully! 🗑️");

      await loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);

      setError(
        err.response?.data ||
          "Failed to delete product."
      );
    }
  };

  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit = editingProduct
    ? handleUpdateProduct
    : handleAddProduct;

  // =========================
  // UI
  // =========================

  return (
    <div className="seller-dashboard">

      {/* HEADER */}

      <div className="seller-header">

        <div>
          <span className="dashboard-label">
            SELLER PANEL
          </span>

          <h1>
            Welcome,{" "}
            {currentUser?.fullName || "Seller"} 👋
          </h1>

          <p>
            Manage your CampusKart products
            from one place.
          </p>
        </div>

        <div className="seller-header-actions">

  <div className="seller-role">
    🏪 SELLER
  </div>

  <button
    type="button"
    className="logout-btn"
    onClick={onLogout}
  >
    🚪 Logout
  </button>

</div>
            
      </div>

      {/* MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* PRODUCT FORM */}

      <div className="product-form-card">

        <div className="form-header">

          <div>
            <span className="form-icon">
              {editingProduct ? "✏️" : "➕"}
            </span>

            <div>
              <h2>
                {editingProduct
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {editingProduct
                  ? "Update your product details"
                  : "Create a new product for your customers"}
              </p>
            </div>
          </div>

          {editingProduct && (
            <button
              type="button"
              className="cancel-top-btn"
              onClick={cancelEdit}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Product Name</label>

              <input
                type="text"
                placeholder="Eg: Wireless Mouse"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <input
                type="text"
                placeholder="Eg: Electronics"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>

              <input
                type="number"
                min="1"
                placeholder="Eg: 799"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>

              <input
                type="number"
                min="1"
                placeholder="Eg: 20"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />
            </div>

          </div>

          <div className="form-group description-group">
            <label>Description</label>

            <textarea
              placeholder="Describe your product..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div className="form-actions">

            {editingProduct && (
              <button
                type="button"
                className="secondary-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingProduct
                ? "💾 Save Changes"
                : "➕ Add Product"}
            </button>

          </div>

        </form>
      </div>

      {/* PRODUCT LIST */}

      <div className="products-card">

        <div className="products-header">

          <div>
            <span className="dashboard-label">
              INVENTORY
            </span>

            <h2>My Products</h2>
          </div>

          <div className="product-count">
            {products.length} Products
          </div>

        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              📦
            </div>

            <h3>No Products Yet</h3>

            <p>
              Add your first product using
              the form above.
            </p>
          </div>
        ) : (
          <div className="product-table">

            {products.map((product) => (

              <div
                className="product-row"
                key={product.id}
              >

                <div className="product-info">

                  <div className="product-avatar">
                    {product.productName
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3>
                      {product.productName}
                    </h3>

                    <span className="category-badge">
                      {product.category}
                    </span>

                    <p>
                      {product.description}
                    </p>
                  </div>

                </div>

                <div className="product-price">
                  ₹
                  {Number(product.price).toLocaleString(
                    "en-IN"
                  )}
                </div>

                <div className="stock-info">
                  <span>Stock</span>

                  <strong>
                    {product.quantity}
                  </strong>
                </div>

                <div className="product-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      startEdit(product)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDeleteProduct(product.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default SellerDashboard;
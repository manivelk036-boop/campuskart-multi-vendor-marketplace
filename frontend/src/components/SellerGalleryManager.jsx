import { useEffect, useState } from "react";
import apiClient from "../apiClient";
import { resolveImageUrl } from "../utils/imageUrl";

function SellerGalleryManager({ sellerId }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadImages = async (productId) => {
    if (!productId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/products/${productId}/images`);
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Unable to load this product gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sellerId) return undefined;
    let active = true;
    apiClient.get(`/products/seller/${sellerId}`).then((response) => {
      if (!active) return;
      const sellerProducts = Array.isArray(response.data) ? response.data : [];
      setProducts(sellerProducts);
      if (sellerProducts[0]) {
        setSelectedProductId(String(sellerProducts[0].id));
        void loadImages(sellerProducts[0].id);
      }
    }).catch(() => { if (active) setError("Unable to load products for image management."); });
    return () => { active = false; };
  }, [sellerId]);

  const selectProduct = (event) => {
    const productId = event.target.value;
    setSelectedProductId(productId);
    setMessage("");
    setError("");
    void loadImages(productId);
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!selectedProductId || !files.length) return;
    try {
      setMessage("");
      setError("");
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await apiClient.post(`/products/${selectedProductId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setMessage(`${files.length} image${files.length === 1 ? "" : "s"} added.`);
      event.target.value = "";
      await loadImages(selectedProductId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to upload gallery images.");
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await apiClient.delete(`/products/${selectedProductId}/images/${imageId}`);
      await loadImages(selectedProductId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this image.");
    }
  };

  const moveImage = async (image, direction) => {
    const nextOrder = Math.max(0, Number(image.displayOrder) + direction);
    try {
      await apiClient.patch(`/products/${selectedProductId}/images/${image.id}/order`, { displayOrder: nextOrder });
      await loadImages(selectedProductId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reorder this image.");
    }
  };

  return (
    <section className="dashboard-card seller-gallery-card">
      <div className="card-heading">
        <div><span className="eyebrow">PRODUCT MEDIA</span><h2>Image Gallery</h2><p>Manage the images shown to customers.</p></div>
      </div>
      {error && <div className="alert error-alert">{error}</div>}
      {message && <div className="alert success-alert">{message}</div>}
      {!products.length ? <div className="empty-box">Create a product to manage its gallery.</div> : (
        <>
          <label className="gallery-product-select">Product<select value={selectedProductId} onChange={selectProduct}>{products.map((product) => <option key={product.id} value={product.id}>{product.productName}</option>)}</select></label>
          <label className="gallery-upload-control">Add images<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImages} disabled={loading} /></label>
          {loading ? <div className="loading-box">Loading images...</div> : !images.length ? <div className="empty-box">No gallery images yet. The product image URL remains available as a fallback.</div> : (
            <div className="seller-gallery-grid">
              {images.map((image, index) => <article className="seller-gallery-item" key={image.id}><img src={resolveImageUrl(image.imageUrl)} alt="Product gallery" /><strong>{index === 0 ? "Primary image" : `Image ${index + 1}`}</strong><div><button type="button" onClick={() => moveImage(image, -1)} disabled={index === 0}>Move left</button><button type="button" onClick={() => moveImage(image, 1)} disabled={index === images.length - 1}>Move right</button><button type="button" onClick={() => deleteImage(image.id)}>Delete</button></div></article>)}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SellerGalleryManager;

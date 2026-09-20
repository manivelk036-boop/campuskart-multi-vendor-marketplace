import { useEffect, useState } from "react";
import apiClient from "../apiClient";
import ProductReviews from "./ProductReviews";
import { resolveImageUrl } from "../utils/imageUrl";
import "./ProductDetails.css";

function ProductDetails({ product, currentUser, isWishlisted, onToggleWishlist, onAddToCart, onClose }) {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get(`/products/${product.id}/images`)
      .then((response) => {
        if (cancelled) return;
        const galleryImages = Array.isArray(response.data) ? response.data : [];
        setActiveIndex(0);
        setImageFailed(false);
        setImages(galleryImages.length ? galleryImages : product.imageUrl ? [{ imageUrl: product.imageUrl, id: "legacy" }] : []);
        setLoadingImages(false);
      })
      .catch(() => {
        if (!cancelled) {
          setActiveIndex(0);
          setImageFailed(false);
          setImages(product.imageUrl ? [{ imageUrl: product.imageUrl, id: "legacy" }] : []);
          setLoadingImages(false);
        }
      });
    return () => { cancelled = true; };
  }, [product.id, product.imageUrl]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const activeImage = resolveImageUrl(images[activeIndex]?.imageUrl);
  const sellerName = product.seller?.fullName || product.seller?.name || product.seller?.email || "CampusKart Seller";
  const rating = Number(product.averageRating || 0).toFixed(1);

  function showPrevious() {
    setActiveIndex((current) => images.length ? (current - 1 + images.length) % images.length : 0);
    setImageFailed(false);
  }

  function showNext() {
    setActiveIndex((current) => images.length ? (current + 1) % images.length : 0);
    setImageFailed(false);
  }

  const selectImage = (index) => {
    setActiveIndex(index);
    setImageFailed(false);
  };

  return (
    <div className="product-details-overlay" role="dialog" aria-modal="true" aria-label={`${product.productName} details`}>
      <div className="product-details-page">
        <button className="product-details-close" type="button" onClick={onClose} aria-label="Close product details">✕</button>
        <div className="product-details-breadcrumb">CampusKart / {product.category?.name || "Products"} / {product.productName}</div>

        <div className="product-details-grid">
          <section className="product-gallery" aria-label="Product image gallery">
            <div className="gallery-thumbnails">
              {images.map((image, index) => (
                <button className={`gallery-thumbnail ${index === activeIndex ? "active" : ""}`} type="button" key={image.id || image.imageUrl} onClick={() => selectImage(index)} aria-label={`View product image ${index + 1}`}>
                  <img src={resolveImageUrl(image.imageUrl)} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
                </button>
              ))}
            </div>
            <div className="gallery-stage">
              {loadingImages ? <div className="gallery-placeholder">Loading images...</div> : activeImage && !imageFailed ? (
                <button className="gallery-main-button" type="button" onClick={() => setLightboxOpen(true)} aria-label="Open image fullscreen">
                  <img src={activeImage} alt={product.productName} onError={() => setImageFailed(true)} />
                  <span className="gallery-zoom-hint">Click to enlarge</span>
                </button>
              ) : <div className="gallery-placeholder">No product image</div>}
              {images.length > 1 && <>
                <button className="gallery-arrow gallery-previous" type="button" onClick={showPrevious} aria-label="Previous image">‹</button>
                <button className="gallery-arrow gallery-next" type="button" onClick={showNext} aria-label="Next image">›</button>
              </>}
            </div>
          </section>

          <section className="product-details-copy">
            <span className="product-details-category">{product.category?.name || "General"}</span>
            <div className="product-details-title-row">
              <h1>{product.productName}</h1>
              <button className={`wishlist-heart product-details-wishlist ${isWishlisted ? "is-wishlisted" : ""}`} type="button" onClick={() => onToggleWishlist(product)} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={isWishlisted}>{isWishlisted ? "♥" : "♡"}</button>
            </div>
            <div className="product-details-rating"><strong>★ {rating}</strong><span>{product.reviewCount || 0} reviews</span></div>
            <p className="product-details-seller">Sold by <strong>{sellerName}</strong></p>
            <div className="product-details-price">₹{Number(product.price || 0).toLocaleString("en-IN")}</div>
            <p className={`product-details-stock ${Number(product.quantity) <= 0 ? "out" : ""}`}>{Number(product.quantity) > 0 ? `In stock · ${product.quantity} available` : "Out of stock"}</p>
            <p className="product-details-description">{product.description || "No description available."}</p>
            <div className="product-details-actions">
              <button className="product-details-cart" type="button" disabled={Number(product.quantity) <= 0} onClick={() => onAddToCart(product)}>{Number(product.quantity) <= 0 ? "Out of Stock" : "Add to Cart"}</button>
              <button className="product-details-buy" type="button" disabled={Number(product.quantity) <= 0} onClick={() => onAddToCart(product)}>Buy Now</button>
            </div>
            <div className="product-details-benefits"><span>✓ Campus delivery</span><span>✓ Secure checkout</span><span>✓ Seller verified</span></div>
          </section>
        </div>

        <ProductReviews productId={product.id} currentUser={currentUser} />
      </div>

      {lightboxOpen && activeImage && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Fullscreen product image" onClick={() => setLightboxOpen(false)}>
          <button className="gallery-lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Close fullscreen image">✕</button>
          <button className="gallery-lightbox-arrow gallery-lightbox-previous" type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} aria-label="Previous image">‹</button>
          <img src={activeImage} alt={product.productName} onClick={(event) => event.stopPropagation()} />
          <button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} aria-label="Next image">›</button>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;

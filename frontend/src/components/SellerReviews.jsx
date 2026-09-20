import { useEffect, useState } from "react";
import apiClient from "../apiClient";
import SellerGalleryManager from "./SellerGalleryManager";
import "./SellerReviews.css";

function SellerReviews({ sellerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      try {
        const response = await apiClient.get(`/reviews/seller/${sellerId}`);
        if (active) setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error("Error loading seller reviews:", requestError);
        if (active) setError("Unable to load product reviews.");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (sellerId) void loadReviews();
    return () => { active = false; };
  }, [sellerId]);

  return (
    <>
    <SellerGalleryManager sellerId={sellerId} />
    <section className="dashboard-card seller-reviews-card" id="reviews">
      <div className="card-heading">
        <div>
          <span className="eyebrow">CUSTOMER VOICE</span>
          <h2>Product Reviews</h2>
          <p>Feedback for your products.</p>
        </div>
        <span className="count-badge">{reviews.length} Reviews</span>
      </div>
      {loading ? <div className="loading-box">Loading product reviews...</div> : error ? <div className="empty-box">{error}</div> : reviews.length === 0 ? <div className="empty-box"><h3>No reviews yet</h3><p>Customer feedback will appear here.</p></div> : (
        <div className="seller-review-list">
          {reviews.map((review) => (
            <article className="seller-review" key={review.id}>
              <div className="seller-review-top">
                <div><strong>{review.reviewerName || "CampusKart Customer"}</strong><span>Product #{review.productId}</span></div>
                <b>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</b>
              </div>
              {review.reviewText && <p>{review.reviewText}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
    </>
  );
}

export default SellerReviews;

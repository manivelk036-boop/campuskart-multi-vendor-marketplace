import { useCallback, useEffect, useState } from "react";
import apiClient from "../apiClient";
import "./ProductReviews.css";

const emptyForm = { rating: 0, reviewText: "" };

function ProductReviews({ productId, currentUser }) {
  const [summary, setSummary] = useState(null);
  const [eligibility, setEligibility] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCustomer = currentUser?.role === "CUSTOMER";

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get(`/reviews/product/${productId}`);
      setSummary(response.data);
      if (isCustomer) {
        const eligibilityResponse = await apiClient.get(`/reviews/product/${productId}/eligibility`);
        setEligibility(Boolean(eligibilityResponse.data?.eligible));
      }
    } catch (requestError) {
      console.error("Error loading product reviews:", requestError);
      setError("Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  }, [isCustomer, productId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadReviews();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadReviews]);

  const ownReview = summary?.reviews?.find(
    (review) => Number(review.userId) === Number(currentUser?.id)
  );

  const submitReview = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      setError("Please choose a rating from 1 to 5 stars.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = editingReviewId
        ? await apiClient.put(`/reviews/${editingReviewId}`, form)
        : await apiClient.post(`/reviews/product/${productId}`, form);

      setSummary((current) => ({
        ...current,
        reviews: editingReviewId
          ? current.reviews.map((review) => review.id === editingReviewId ? response.data : review)
          : [response.data, ...current.reviews],
        reviewCount: editingReviewId ? current.reviewCount : current.reviewCount + 1,
        averageRating: editingReviewId
          ? current.averageRating
          : ((current.averageRating * current.reviewCount) + form.rating) / (current.reviewCount + 1),
      }));
      setEligibility(false);
      setEditingReviewId(null);
      setForm(emptyForm);
      await loadReviews();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your review.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setForm({ rating: review.rating, reviewText: review.reviewText || "" });
    setError("");
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      setError("");
      await apiClient.delete(`/reviews/${reviewId}`);
      setEditingReviewId(null);
      setForm(emptyForm);
      await loadReviews();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete your review.");
    }
  };

  if (loading) {
    return <section className="product-reviews"><h4>Reviews</h4><p className="reviews-muted">Loading reviews...</p></section>;
  }

  return (
    <section className="product-reviews">
      <div className="reviews-heading">
        <div>
          <h4>Customer Reviews</h4>
          <p>{summary?.reviewCount || 0} review{summary?.reviewCount === 1 ? "" : "s"}</p>
        </div>
        <strong className="average-rating">★ {Number(summary?.averageRating || 0).toFixed(1)}</strong>
      </div>

      {error && <p className="reviews-error">{error}</p>}

      {isCustomer && (eligibility || editingReviewId) && (
        <form className="review-form" onSubmit={submitReview}>
          <div className="review-form-header">
            <strong>{editingReviewId ? "Edit your review" : "Share your experience"}</strong>
            <span>{form.rating ? `${form.rating}/5` : "Choose a rating"}</span>
          </div>
          <div className="star-picker" aria-label="Choose a rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                className={value <= form.rating ? "selected" : ""}
                key={value}
                onClick={() => setForm((current) => ({ ...current, rating: value }))}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >★</button>
            ))}
          </div>
          <textarea
            value={form.reviewText}
            maxLength={1000}
            onChange={(event) => setForm((current) => ({ ...current, reviewText: event.target.value }))}
            placeholder="Tell other students what you think (optional)"
            rows="3"
          />
          <div className="review-form-actions">
            {editingReviewId && <button type="button" onClick={() => { setEditingReviewId(null); setForm(emptyForm); }}>Cancel</button>}
            <button type="submit" disabled={saving}>{saving ? "Saving..." : editingReviewId ? "Update Review" : "Post Review"}</button>
          </div>
        </form>
      )}

      {!summary?.reviews?.length ? (
        <p className="reviews-muted">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div className="review-list">
          {summary.reviews.map((review) => {
            const isOwnReview = Number(review.userId) === Number(currentUser?.id);
            return (
              <article className="review-item" key={review.id}>
                <div className="review-item-top">
                  <div>
                    <strong>{review.reviewerName || "CampusKart Customer"}</strong>
                    <span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                  </div>
                  {isOwnReview && (
                    <div className="review-item-actions">
                      <button type="button" onClick={() => startEditing(review)}>Edit</button>
                      <button type="button" onClick={() => deleteReview(review.id)}>Delete</button>
                    </div>
                  )}
                </div>
                {review.reviewText && <p>{review.reviewText}</p>}
              </article>
            );
          })}
        </div>
      )}

      {isCustomer && ownReview && !editingReviewId && (
        <p className="reviews-muted">You have reviewed this product.</p>
      )}
    </section>
  );
}

export default ProductReviews;

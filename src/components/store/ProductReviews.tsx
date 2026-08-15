import type { ProductReview } from "@/lib/products";

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (!reviews.length) return null;

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="product-reviews" aria-labelledby="reviews-title">
      <h2 id="reviews-title">Reviews</h2>
      <p className="product-reviews-note">
        {average.toFixed(1)} average · {reviews.length} verified review
        {reviews.length === 1 ? "" : "s"}
      </p>
      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="product-review-card">
            <p className="product-review-author">{review.author}</p>
            <p className="product-review-rating" aria-label={`${review.rating} stars`}>
              {"★".repeat(review.rating)}
              {review.verifiedPurchase ? " · Verified purchase" : ""}
            </p>
            <p className="product-review-body">{review.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { ProductReview } from "@/lib/products";

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section className="product-reviews" aria-labelledby="reviews-title">
      <h2 id="reviews-title">Reviews</h2>
      <p className="product-reviews-note">
        Placeholder reviews below — replace before publishing.
      </p>
      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="product-review-card">
            <p className="product-review-author">{review.author}</p>
            {review.rating !== null ? (
              <p className="product-review-rating" aria-label={`${review.rating} stars`}>
                {"★".repeat(review.rating)}
              </p>
            ) : (
              <p className="product-review-rating product-review-rating--todo">
                TODO: star rating
              </p>
            )}
            <p className="product-review-body">{review.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="product-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-skeleton-card" key={i}>
          <div className="skeleton-shimmer skeleton-image" />
          <div className="skeleton-shimmer skeleton-line skeleton-line-short" />
          <div className="skeleton-shimmer skeleton-line skeleton-line-long" />
          <div className="skeleton-shimmer skeleton-line skeleton-line-price" />
        </div>
      ))}
    </div>
  );
}
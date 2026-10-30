export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="banner-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

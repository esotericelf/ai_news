export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <h2>Something went wrong</h2>
      <p>{message || 'We could not load this content. Please try again.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

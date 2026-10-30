export default function Loading({ text = "Loading…", full = false }) {
  return (
    <div className={`loading${full ? " full" : ""}`} role="status">
      <span className="spinner" />
      {text}
    </div>
  );
}

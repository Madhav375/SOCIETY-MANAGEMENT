export default function StatCard({ variant, value, label }) {
  return (
    <div className={`stat st-${variant}`}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

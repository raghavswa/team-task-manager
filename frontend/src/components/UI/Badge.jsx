export default function Badge({ label, colorClass, dot }) {
  return (
    <span className={`badge ${colorClass}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />}
      {label}
    </span>
  );
}

import "./StatsCard.css";


export default function StatsCard({
  title,
  value,
  color,
  icon,
}) {
  return (
    <div className="stats-card">
      <div
        className="stats-icon"
        style={{ background: color }}
      >
        {icon}
      </div>

      <div>
        <h4>{title}</h4>

        <h2>{value}</h2>
      </div>
    </div>
  );
}
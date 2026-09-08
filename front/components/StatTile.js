// components/StatTile.js
function StatTile({ icon, tone, label, value }) {
  return (
    <div className="sb-stat">
      <div className="sb-stat__top">
        <div className={`sb-stat__ico tone-${tone}`}>{icon}</div>
        <div className="sb-stat__label">{label}</div>
      </div>
      <div className="sb-stat__val">{value ?? "-"}</div>
    </div>
  );
}

export default StatTile;

"use client";

function getColor(s: number) {
  if (s >= 75) return "#10b981";
  if (s >= 50) return "#f59e0b";
  if (s >= 25) return "#ef4444";
  return "#dc2626";
}
function getLabel(s: number) {
  if (s >= 75) return "Excellent";
  if (s >= 50) return "Good";
  if (s >= 25) return "Needs Work";
  return "Critical";
}

export function HealthGauge({ score, trend }: { score: number; trend: string }) {
  const color = getColor(score);
  const label = getLabel(score);
  const trendIcon = trend === "improving" ? "↑" : trend === "declining" ? "↓" : "→";
  const trendColor = trend === "improving" ? "#10b981" : trend === "declining" ? "#ef4444" : "#475569";

  // SVG arc
  const R = 54, cx = 70, cy = 76;
  const startAngle = 215, sweepDeg = 230;
  const fillDeg = Math.min(sweepDeg, (score / 100) * sweepDeg);

  function pt(deg: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  }
  function arc(s: number, e: number) {
    const sp = pt(s), ep = pt(e);
    const large = e - s > 180 ? 1 : 0;
    return `M ${sp.x.toFixed(2)} ${sp.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${ep.x.toFixed(2)} ${ep.y.toFixed(2)}`;
  }

  return (
    <div className="flex flex-col items-center select-none">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <path d={arc(startAngle, startAngle + sweepDeg)}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        {score > 0 && (
          <path d={arc(startAngle, startAngle + fillDeg)}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        )}
        {/* Score */}
        <text x="70" y="71" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="30" fontWeight="900" fontFamily="Poppins,sans-serif">
          {score}
        </text>
        <text x="70" y="90" textAnchor="middle"
          fill="#334155" fontSize="11" fontFamily="Poppins,sans-serif">/ 100</text>
      </svg>
      <div className="text-center -mt-2">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>{label}</p>
        <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-wider" style={{ color: trendColor }}>{trendIcon} {trend}</p>
      </div>
    </div>
  );
}

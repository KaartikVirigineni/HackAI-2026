interface ControlBarProps {
  percentage: number;
}

export default function ControlBar({ percentage }: ControlBarProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono glow-red">🔴 APT</span>
        <span className="text-xs font-display tracking-wider text-foreground">
          CONTROL: {percentage.toFixed(0)}%
        </span>
        <span className="text-xs font-mono glow-cyan">ADMIN 🔵</span>
      </div>
      <div className="h-4 rounded-sm overflow-hidden bg-muted terminal-border relative">
        {/* Red side */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300"
          style={{
            width: `${100 - percentage}%`,
            background: 'linear-gradient(90deg, hsl(0 85% 45%), hsl(0 85% 55%))',
            boxShadow: '0 0 15px hsl(0 100% 50% / 0.5)',
          }}
        />
        {/* Blue side */}
        <div
          className="absolute inset-y-0 right-0 transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, hsl(200 100% 45%), hsl(200 100% 55%))',
            boxShadow: '0 0 15px hsl(200 100% 50% / 0.5)',
          }}
        />
        {/* Center marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10 transition-all duration-300"
          style={{ left: `${100 - percentage}%` }}
        />
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline pointer-events-none" />
      </div>
    </div>
  );
}

type LogoProps = { size?: number; className?: string };

// Minimal wheel mark: outer rim + 5 spokes + hub. 5-spoke chosen so the
// rotated spokes don't visually align with horizontal/vertical edges.
export function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const x2 = 16 + Math.cos(angle) * 11;
        const y2 = 16 + Math.sin(angle) * 11;
        return (
          <line
            key={i}
            x1={16}
            y1={16}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
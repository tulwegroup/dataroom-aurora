interface AuroraLogoProps {
  className?: string;
}

export function AuroraLogo({ className }: AuroraLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" stroke="#F59E0B" strokeWidth="2" fill="none" />
      
      {/* Inner glow effect */}
      <circle cx="50" cy="50" r="35" stroke="#F59E0B" strokeWidth="1" fill="none" opacity="0.5" />
      
      {/* Aurora waves */}
      <path
        d="M20 50 Q35 30, 50 50 T80 50"
        stroke="#F59E0B"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 45 Q35 25, 50 45 T80 45"
        stroke="#F59E0B"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M20 55 Q35 35, 50 55 T80 55"
        stroke="#F59E0B"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      
      {/* Center dot */}
      <circle cx="50" cy="50" r="4" fill="#F59E0B" />
      
      {/* Orbital dots */}
      <circle cx="50" cy="15" r="2" fill="#F59E0B" />
      <circle cx="85" cy="50" r="2" fill="#F59E0B" />
      <circle cx="50" cy="85" r="2" fill="#F59E0B" />
      <circle cx="15" cy="50" r="2" fill="#F59E0B" />
    </svg>
  );
}

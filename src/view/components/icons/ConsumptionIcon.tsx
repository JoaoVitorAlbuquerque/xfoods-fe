interface ConsumptionIconProps {
  className?: string;
  isActive?: string;
}

export function ConsumptionIcon({ className, isActive }: ConsumptionIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M4 8h9.33M4 16h6.67M4 24h9.33"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 6.67 26.67 16 20 25.33"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.33 16h9.34"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

interface AnalyticsIconProps {
  className?: string;
  isActive?: string;
}

export function AnalyticsIcon({ className, isActive }: AnalyticsIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M4 4v22.67c0 .73.6 1.33 1.33 1.33H28"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33 22.67v-6.67M15.33 22.67V9.33M21.33 22.67v-9.34M27.33 22.67V6.67"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

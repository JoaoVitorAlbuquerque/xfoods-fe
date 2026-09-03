interface PricingIconProps {
  className?: string;
  isActive?: string;
}

export function PricingIcon({ className, isActive }: PricingIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M17.1 3.9 28.1 14.9a1.33 1.33 0 0 1 0 1.88l-11.3 11.3a1.33 1.33 0 0 1-1.89 0L3.9 16.9a1.33 1.33 0 0 1-.39-.94V5.33c0-.74.6-1.34 1.34-1.34h10.62c.36 0 .7.14.95.4Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33 9.33h.02"
        stroke={isActive || "#666"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18.67 12h-4a1.67 1.67 0 0 0 0 3.33h2.66a1.67 1.67 0 0 1 0 3.34h-4M16.67 10.67v10.66"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

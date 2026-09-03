interface PurchasesIconProps {
  className?: string;
  isActive?: string;
}

export function PurchasesIcon({ className, isActive }: PurchasesIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M3 5.33h3.2l2.4 14.4a2.67 2.67 0 0 0 2.63 2.23h11.2a2.67 2.67 0 0 0 2.62-2.15l1.62-8.48H8"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="26.67" r="1.67" stroke={isActive || "#666"} strokeWidth="2" />
      <circle cx="23" cy="26.67" r="1.67" stroke={isActive || "#666"} strokeWidth="2" />
    </svg>
  );
}

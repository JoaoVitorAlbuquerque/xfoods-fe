interface ProductionIconProps {
  className?: string;
  isActive?: string;
}

export function ProductionIcon({ className, isActive }: ProductionIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M5.33 13.33 12 17.33v-4l6.67 4v-4l6.67 4v9.34c0 .73-.6 1.33-1.34 1.33H6.67c-.74 0-1.34-.6-1.34-1.33V13.33Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.67 4h4l-.67 6.67h-2.67L10.67 4Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

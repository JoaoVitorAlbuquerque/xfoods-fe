interface StockIconProps {
  className?: string;
  isActive?: string;
}

export function StockIcon({ className, isActive }: StockIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M4 10.67 16 4l12 6.67M4 10.67 16 17.33m-12-6.66v10.66L16 28M28 10.67 16 17.33m12-6.66v10.66L16 28m0-10.67V28M10 7.33l12 6.67"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

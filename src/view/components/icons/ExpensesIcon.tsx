interface ExpensesIconProps {
  className?: string;
  isActive?: string;
}

export function ExpensesIcon({ className, isActive }: ExpensesIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M7.33 3.33h17.34c.73 0 1.33.6 1.33 1.34v23.66l-4-2.66-3.33 2.66-3.34-2.66-3.33 2.66-4-2.66V4.67c0-.74.6-1.34 1.33-1.34Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.67h8M12 16h8"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

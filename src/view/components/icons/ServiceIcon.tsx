interface ServiceIconProps {
  className?: string;
  isActive?: string;
}

/** Bandeja de garçom — a seção de atendimento/comanda. */
export function ServiceIcon({ className, isActive }: ServiceIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M16 6.66667V4M4 22.6667H28M6.66667 22.6667C6.66667 17.5507 10.8841 13.3333 16 13.3333C21.1159 13.3333 25.3333 17.5507 25.3333 22.6667M9.33333 28H22.6667"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SettingsIconProps {
  className?: string;
  isActive?: string;
}

export function SettingsIcon({ className, isActive }: SettingsIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="none">
      <path
        d="M13.4 4.8a1.33 1.33 0 0 1 1.31-1.07h2.58a1.33 1.33 0 0 1 1.31 1.07l.32 1.6a10.3 10.3 0 0 1 2.4 1.39l1.55-.52a1.33 1.33 0 0 1 1.57.6l1.29 2.23a1.33 1.33 0 0 1-.26 1.66l-1.23 1.09a10.4 10.4 0 0 1 0 2.78l1.23 1.09a1.33 1.33 0 0 1 .26 1.66l-1.29 2.23a1.33 1.33 0 0 1-1.57.6l-1.55-.52a10.3 10.3 0 0 1-2.4 1.39l-.32 1.6a1.33 1.33 0 0 1-1.31 1.07h-2.58a1.33 1.33 0 0 1-1.31-1.07l-.32-1.6a10.3 10.3 0 0 1-2.4-1.39l-1.55.52a1.33 1.33 0 0 1-1.57-.6l-1.29-2.23a1.33 1.33 0 0 1 .26-1.66l1.23-1.09a10.4 10.4 0 0 1 0-2.78l-1.23-1.09a1.33 1.33 0 0 1-.26-1.66l1.29-2.23a1.33 1.33 0 0 1 1.57-.6l1.55.52a10.3 10.3 0 0 1 2.4-1.39l.32-1.6Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        stroke={isActive || "#666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

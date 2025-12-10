export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stamp base */}
      <rect x="20" y="50" width="60" height="35" rx="3" fill="#FF6B2C" />
      <rect x="22" y="52" width="56" height="31" rx="2" fill="#FF8D5C" />
      
      {/* Document lines */}
      <rect x="30" y="60" width="40" height="3" rx="1.5" fill="white" opacity="0.9" />
      <rect x="30" y="68" width="30" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="30" y="76" width="35" height="3" rx="1.5" fill="white" opacity="0.7" />
      
      {/* Handle */}
      <ellipse cx="50" cy="30" rx="15" ry="12" fill="#8B92B0" />
      <ellipse cx="50" cy="28" rx="12" ry="10" fill="#A0A7C0" />
      <path d="M 50 38 L 50 50" stroke="#8B92B0" strokeWidth="8" strokeLinecap="round" />
      
      {/* Shine effect */}
      <ellipse cx="45" cy="25" rx="4" ry="3" fill="white" opacity="0.4" />
    </svg>
  );
}

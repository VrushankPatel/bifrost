import React from 'react';

interface BifrostIconProps {
  className?: string;
}

export const BifrostIcon: React.FC<BifrostIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Norse-inspired runic design for Bifrost */}
      <g>
        {/* Central bridge/path */}
        <path
          d="M6 16L26 16M16 6L16 26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Connecting runes */}
        <path
          d="M10 10L16 16L22 10M10 22L16 16L22 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Corner runes */}
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <circle cx="24" cy="8" r="2" fill="currentColor" />
        <circle cx="8" cy="24" r="2" fill="currentColor" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        {/* Central nexus */}
        <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
    </svg>
  );
};
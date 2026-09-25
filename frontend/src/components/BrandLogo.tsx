import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8 w-auto', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RoadGuard AI Shield Logo"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="eyeGrad" x1="12" y1="14" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d="M20 3L6 8.5V18.2C6 27.5 12 35.8 20 38C28 35.8 34 27.5 34 18.2V8.5L20 3Z"
        fill="#0F172A"
        stroke="url(#shieldGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 20C12 20 15 15 20 15C25 15 28 20 28 20C28 20 25 25 20 25C15 25 12 20 12 20Z"
        stroke="url(#eyeGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="#10B981" />
      <path
        d="M20 7V10M20 30V33M7 20H10M30 20H33"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

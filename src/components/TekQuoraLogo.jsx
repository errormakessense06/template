import React from 'react';

export default function TekQuoraLogo({ className = "h-24", showText = true }) {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Emblem SVG */}
      <div className="relative w-20 h-20 mb-3 drop-shadow-md">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="tekBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="50%" stopColor="#6C2BD9" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
            <linearGradient id="tekTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
          
          {/* Rounded Squircle Container */}
          <rect x="5" y="5" width="90" height="90" rx="28" fill="url(#tekBgGrad)" />
          
          {/* Tech Circuit 'T' Icon */}
          <path 
            d="M28 32 C28 32, 45 32, 50 32 C55 32, 72 32, 72 32 C74.2 32, 76 33.8, 76 36 C76 38.2, 74.2 40, 72 40 L54 40 L54 68 C54 70.2, 52.2 72, 50 72 C47.8 72, 46 70.2, 46 68 L46 40 L28 40 C25.8 40, 24 38.2, 24 36 C24 33.8, 25.8 32, 28 32 Z" 
            fill="#FFFFFF" 
          />
          
          {/* Left Circuit Node */}
          <circle cx="34" cy="52" r="4" fill="#FFFFFF" />
          <line x1="34" y1="40" x2="34" y2="52" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

          {/* Right Circuit Node */}
          <circle cx="66" cy="56" r="4" fill="#FFFFFF" />
          <line x1="66" y1="40" x2="66" y2="56" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center text-3xl font-extrabold tracking-tight">
          <span className="text-[#0066FF]">Tek</span>
          <span className="text-[#9333EA]">Quora</span>
        </div>
      )}
    </div>
  );
}

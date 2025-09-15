import React from 'react';

export default function MadeWithApplaa() {
  return (
    <div className="flex items-center justify-center space-x-2 text-xs text-slate-300">
      <span>Made with</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90">
        <path d="M12 21s-6-4.35-9-8.5C0 8 4 3 8.5 3S12 6 12 6s1.5-3 3.5-3 4.5 3 4.5 7.5C20 16.65 16 21 12 21z" fill="url(#g)" />
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#6EE7B7" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <span>Applaa</span>
    </div>
  );
}
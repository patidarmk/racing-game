import React, { useEffect, useState } from 'react';

export default function HUD() {
  // HUD uses localStorage for high score demo purposes
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('applaa_racer_high');
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // placeholder subscription spot for live score updates from GameCanvas (if connected)
  }, []);

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">Score</div>
          <div className="text-2xl font-bold">0</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Distance</div>
          <div className="text-2xl font-bold">0 m</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Level</div>
          <div className="text-2xl font-bold">1</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300">
        High Score: <span className="font-semibold">{highScore}</span>
      </div>
    </div>
  );
}
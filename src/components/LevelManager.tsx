import React, { useState } from 'react';

export type Level = {
  id: number;
  name: string;
  theme: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  description: string;
  spawnMultiplier: number;
  trafficSpeedMultiplier: number;
};

export const levels: Level[] = [
  { id: 1, name: 'City Drive', theme: 'city', difficulty: 'Easy', description: 'Neon signs and light traffic. Great for warm-up.', spawnMultiplier: 1, trafficSpeedMultiplier: 1 },
  { id: 2, name: 'Desert Run', theme: 'desert', difficulty: 'Normal', description: 'Sandy winds and longer sight lines. Watch for dunes.', spawnMultiplier: 1.1, trafficSpeedMultiplier: 1.05 },
  { id: 3, name: 'Forest Sprint', theme: 'forest', difficulty: 'Normal', description: 'Narrow roads and roadside trees. Visibility lower.', spawnMultiplier: 1.2, trafficSpeedMultiplier: 1.1 },
  { id: 4, name: 'Night Chase', theme: 'night', difficulty: 'Hard', description: 'Lights and glare reduce reaction time. Traffic is faster.', spawnMultiplier: 1.4, trafficSpeedMultiplier: 1.25 },
  { id: 5, name: 'Snow Drift', theme: 'snow', difficulty: 'Hard', description: 'Slippery lanes and drifting — control matters.', spawnMultiplier: 1.6, trafficSpeedMultiplier: 1.35 },
  { id: 6, name: 'Neon Overdrive', theme: 'neon', difficulty: 'Expert', description: 'High speed, dense traffic, and synthetics lights.', spawnMultiplier: 2, trafficSpeedMultiplier: 1.6 }
];

export default function LevelManager() {
  const [current] = useState(levels[0]);

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Current Level</h4>
          <div className="text-sm text-slate-300">{current.name} • <span className="text-xs text-slate-400">{current.theme}</span></div>
        </div>
        <div>
          <button className="px-3 py-1 bg-applaa-blue text-white rounded-md text-sm">Change</button>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">Levels include visual themes and difficulty scaling. Use the Levels page to pick another stage.</p>
    </div>
  );
}
import React from 'react';
import { levels } from '../components/LevelManager';
import { Link } from 'react-router-dom';

export default function Levels() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Levels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map((lvl) => (
          <div key={lvl.id} className="p-4 rounded-xl glass-card shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">{lvl.name}</h3>
                <p className="text-sm text-slate-300">{lvl.description}</p>
              </div>
              <div className="text-sm text-slate-400">Difficulty: {lvl.difficulty}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Link to="/" className="text-sm text-applaa-blue hover:underline">Play</Link>
              <div className="text-xs text-slate-400">{lvl.theme}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
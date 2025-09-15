import React from 'react';
import GameCanvas from '../components/GameCanvas';
import HUD from '../components/HUD';
import Controls from '../components/Controls';
import LevelManager from '../components/LevelManager';

export default function Index() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <section className="md:col-span-2">
        <div className="relative bg-gradient-to-b from-black/40 to-black/10 rounded-2xl overflow-hidden shadow-lg glass-card p-4">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-applaa-blue to-applaa-purple">
            Applaa Racer
          </h1>
          <p className="mt-2 text-sm text-slate-300">High-fidelity top-down racer — crisp Canvas rendering, smooth controls, progressive levels.</p>

          <div className="mt-4 rounded-lg overflow-hidden shadow-inner">
            <GameCanvas />
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <HUD />
        <LevelManager />
        <Controls />
      </aside>
    </div>
  );
}
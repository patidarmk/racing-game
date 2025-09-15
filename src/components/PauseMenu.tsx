import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
};

export default function PauseMenu({ isOpen, onResume, onRestart, onLevelSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 glass-card p-6 rounded-2xl w-80"
      >
        <h3 className="text-lg font-bold">Paused</h3>
        <p className="text-sm text-slate-300 mt-2">Take a breather or restart the run.</p>

        <div className="mt-4 flex flex-col gap-3">
          <button className="px-4 py-2 bg-applaa-blue text-white rounded-md" onClick={onResume}>Resume</button>
          <button className="px-4 py-2 bg-white/6 text-white rounded-md" onClick={onRestart}>Restart</button>
          <button className="px-4 py-2 bg-white/4 text-white rounded-md" onClick={onLevelSelect}>Level Select</button>
        </div>
      </motion.div>
    </div>
  );
}
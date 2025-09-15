import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Props = {
  onLeft?: () => void;
  onRight?: () => void;
  onLeftUp?: () => void;
  onRightUp?: () => void;
};

export default function Controls({ onLeft, onRight, onLeftUp, onRightUp }: Props) {
  // Buttons call handlers if provided. GameCanvas uses its own listeners but these large
  // controls are useful for mobile tappable areas.
  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="font-semibold">Controls</h4>

      <div className="mt-3 flex items-center justify-between">
        <button
          className="control-btn"
          onTouchStart={onLeft}
          onTouchEnd={onLeftUp}
          onMouseDown={onLeft}
          onMouseUp={onLeftUp}
          aria-label="Left"
        >
          <ArrowLeft />
        </button>

        <div className="text-sm text-slate-300">Hold to steer • Swipe left/right to change lanes</div>

        <button
          className="control-btn"
          onTouchStart={onRight}
          onTouchEnd={onRightUp}
          onMouseDown={onRight}
          onMouseUp={onRightUp}
          aria-label="Right"
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
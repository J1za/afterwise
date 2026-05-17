'use client';

import { motion } from 'framer-motion';
import type { EyeProps } from '@/types';

export function Eye({
  cx,
  cy,
  size = 7,
  target,
  mood,
  blinking = false,
  wink = false,
}: EyeProps) {
  const range = size * 0.45;
  const dx = Math.max(-1, Math.min(1, target.x)) * range;
  const dy = Math.max(-1, Math.min(1, target.y)) * range;
  const closed = mood === 'covered' || blinking || wink;
  const sad = mood === 'sad';
  const scaleY = closed ? 0.05 : sad ? 0.5 : 1;

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g
        style={{
          transform: `scaleY(${scaleY})`,
          transformOrigin: 'center',
          transformBox: 'fill-box',
          transition: 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ellipse cx={0} cy={0} rx={size} ry={size} fill="#ffffff" />
      </g>
      <motion.circle
        cx={0}
        cy={0}
        r={size * 0.5}
        fill="#0a0a0f"
        animate={{
          cx: dx,
          cy: dy + (sad ? size * 0.3 : 0),
          opacity: closed ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      />
    </g>
  );
}

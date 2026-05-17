'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useCharacterBlink } from '@/hooks';
import type {
  AuthCharacterProps,
  AuthSceneProps,
  EyeTarget,
} from '@/types';
import { Eye } from './eye';

export function AuthScene({ mood }: AuthSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [eye, setEye] = useState<EyeTarget>({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(event: MouseEvent) {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (event.clientX - centerX) / (rect.width / 2);
      const dy = (event.clientY - centerY) / (rect.height / 2);
      setEye({ x: dx, y: dy });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const groupY = mood === 'happy' ? -10 : mood === 'sad' ? 6 : 0;

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-secondary/40 p-8"
    >
      <motion.svg
        viewBox="0 0 400 480"
        className="h-full w-full max-w-md"
        animate={{ y: groupY }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <PurpleCharacter mood={mood} eye={eye} />
        <BlackCharacter mood={mood} eye={eye} />
        <YellowCharacter mood={mood} eye={eye} />
        <OrangeCharacter mood={mood} eye={eye} />
      </motion.svg>
    </div>
  );
}

function tilt(eye: EyeTarget, max = 3) {
  return Math.max(-max, Math.min(max, eye.x * max));
}

function OrangeCharacter({ mood, eye }: AuthCharacterProps) {
  const isHappy = mood === 'happy';
  const blinking = useCharacterBlink({ delay: 0 });
  const mouth = (() => {
    if (mood === 'sad') return 'M 105 432 Q 130 415 155 432';
    if (mood === 'covered') return 'M 120 428 Q 130 432 140 428';
    if (isHappy) return 'M 100 425 Q 130 450 160 425';
    return 'M 120 432 Q 130 442 140 432';
  })();

  return (
    <motion.g
      animate={{ y: [0, -3, 0], rotate: tilt(eye, 1.5) }}
      transition={{
        y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
        rotate: { type: 'spring', stiffness: 60, damping: 14 },
      }}
      style={{ transformBox: 'fill-box', transformOrigin: '130px 440px' }}
    >
      <ellipse cx={130} cy={440} rx={120} ry={110} fill="#f4a268" />
      <Eye
        cx={108}
        cy={400}
        size={6}
        target={eye}
        mood={mood}
        blinking={blinking}
        wink={isHappy}
      />
      <Eye
        cx={155}
        cy={400}
        size={6}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <motion.path
        d={mouth}
        fill="none"
        stroke="#0a0a0f"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: mouth }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <circle cx={92} cy={430} r={3.5} fill="#0a0a0f" />
      <circle cx={172} cy={430} r={3.5} fill="#0a0a0f" />
    </motion.g>
  );
}

function PurpleCharacter({ mood, eye }: AuthCharacterProps) {
  const isHappy = mood === 'happy';
  const blinking = useCharacterBlink({ delay: 600 });
  const mouth = (() => {
    if (mood === 'sad') return 'M 105 325 Q 118 315 132 325';
    if (mood === 'covered') return 'M 110 322 L 128 322';
    if (isHappy) return 'M 100 318 Q 118 335 136 318';
    return 'M 108 322 Q 118 330 128 322';
  })();

  return (
    <motion.g
      animate={{ y: [0, -4, 0], rotate: tilt(eye, 2) }}
      transition={{
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
        rotate: { type: 'spring', stiffness: 60, damping: 14 },
      }}
      style={{ transformBox: 'fill-box', transformOrigin: '115px 440px' }}
    >
      <path
        d="M 60 250 Q 60 230 80 230 L 150 230 Q 170 230 170 250 L 170 440 L 60 440 Z"
        fill="#5b3df0"
      />
      <path
        d="M 60 245 Q 80 235 100 245 Q 120 255 140 245 Q 160 235 170 245 L 170 250 L 60 250 Z"
        fill="#5b3df0"
      />
      <Eye
        cx={95}
        cy={290}
        size={6}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <Eye
        cx={140}
        cy={290}
        size={6}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <motion.path
        d={mouth}
        fill="none"
        stroke="#0a0a0f"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: mouth }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </motion.g>
  );
}

function BlackCharacter({ mood, eye }: AuthCharacterProps) {
  const isHappy = mood === 'happy';
  const blinking = useCharacterBlink({ delay: 1400 });
  const mouth = (() => {
    if (mood === 'sad') return 'M 215 360 Q 225 352 235 360';
    if (mood === 'covered') return 'M 218 358 L 232 358';
    if (isHappy) return 'M 213 354 Q 225 368 237 354';
    return 'M 218 358 Q 225 364 232 358';
  })();

  return (
    <motion.g
      animate={{ y: [0, -2.5, 0], rotate: tilt(eye, 2.5) }}
      transition={{
        y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 },
        rotate: { type: 'spring', stiffness: 60, damping: 14 },
      }}
      style={{ transformBox: 'fill-box', transformOrigin: '225px 440px' }}
    >
      <rect x={180} y={290} width={90} height={150} rx={14} fill="#1a1a22" />
      <Eye
        cx={205}
        cy={330}
        size={5.5}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <Eye
        cx={245}
        cy={330}
        size={5.5}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <motion.path
        d={mouth}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: mouth }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </motion.g>
  );
}

function YellowCharacter({ mood, eye }: AuthCharacterProps) {
  const isHappy = mood === 'happy';
  const blinking = useCharacterBlink({ delay: 2200 });
  const mouth = (() => {
    if (mood === 'sad') return 'M 310 392 Q 321 384 332 392';
    if (mood === 'covered') return 'M 312 388 L 330 388';
    if (isHappy) return 'M 305 386 Q 321 398 337 386';
    return 'M 308 388 L 334 388';
  })();

  return (
    <motion.g
      animate={{ y: [0, -3, 0], rotate: tilt(eye, 1.8) }}
      transition={{
        y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.3 },
        rotate: { type: 'spring', stiffness: 60, damping: 14 },
      }}
      style={{ transformBox: 'fill-box', transformOrigin: '321px 440px' }}
    >
      <path
        d="M 280 440 L 280 360 Q 280 305 321 305 Q 360 305 360 360 L 360 440 Z"
        fill="#fbd84a"
      />
      <Eye
        cx={307}
        cy={362}
        size={5}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <Eye
        cx={335}
        cy={362}
        size={5}
        target={eye}
        mood={mood}
        blinking={blinking}
      />
      <motion.path
        d={mouth}
        fill="none"
        stroke="#0a0a0f"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: mouth }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </motion.g>
  );
}

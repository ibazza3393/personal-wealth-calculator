'use client';

import { useRef, type PointerEvent } from 'react';

export function WealthCard() {
  const card = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 18;
    const rx = (0.5 - py) * 12;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.setProperty('--shine-x', `${px * 100}%`);
    el.style.setProperty('--shine-y', `${py * 100}%`);
  };

  const reset = () => {
    const el = card.current;
    if (!el) return;
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className="card-stage mx-auto w-full max-w-[340px]">
      <div
        ref={card}
        className="wealth-card relative aspect-[1.586] w-full overflow-hidden rounded-[18px] p-6"
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        <div className="wealth-card-shine pointer-events-none absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--label)]/50">WEALTH</p>
          <div>
            <p className="text-[15px] font-medium">Personal</p>
            <p className="text-[13px] text-[var(--secondary)]">Private holdings · live markets</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

type Name =
  | 'square.grid.2x2'
  | 'chart.bar'
  | 'link'
  | 'creditcard'
  | 'arrow.left.arrow.right'
  | 'chart.line.uptrend.xyaxis'
  | 'sidebar.left'
  | 'sidebar.right';

export function SfIcon({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      aria-hidden
    >
      {GLYPH[name]}
    </svg>
  );
}

const GLYPH: Record<Name, ReactNode> = {
  'square.grid.2x2': (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.75" />
      <rect x="13" y="3" width="8" height="8" rx="1.75" />
      <rect x="3" y="13" width="8" height="8" rx="1.75" />
      <rect x="13" y="13" width="8" height="8" rx="1.75" />
    </>
  ),
  'chart.bar': (
    <>
      <rect x="4" y="11" width="4.5" height="10" rx="1.25" />
      <rect x="9.75" y="4" width="4.5" height="17" rx="1.25" />
      <rect x="15.5" y="8" width="4.5" height="13" rx="1.25" />
    </>
  ),
  link: (
    <path d="M9.2 14.8a4.2 4.2 0 0 1 0-5.9l1.1-1.1a4.2 4.2 0 0 1 5.9 5.9l-.8.8a1.15 1.15 0 1 1-1.6-1.6l.8-.8a1.9 1.9 0 1 0-2.7-2.7l-1.1 1.1a1.9 1.9 0 0 0 0 2.7 1.15 1.15 0 1 1-1.6 1.6Zm5.6-5.6a4.2 4.2 0 0 1 0 5.9l-1.1 1.1a4.2 4.2 0 1 1-5.9-5.9l.8-.8a1.15 1.15 0 1 1 1.6 1.6l-.8.8a1.9 1.9 0 1 0 2.7 2.7l1.1-1.1a1.9 1.9 0 0 0 0-2.7 1.15 1.15 0 0 1 1.6-1.6Z" />
  ),
  creditcard: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.25" />
      <rect x="2.5" y="9" width="19" height="2.25" fill="#fff" fillOpacity="0.35" />
    </>
  ),
  'arrow.left.arrow.right': (
    <path d="M8.2 7.2 5.4 10l2.8 2.8a1.05 1.05 0 0 1-1.5 1.5L3.1 10.7a1.6 1.6 0 0 1 0-2.3l3.6-3.6a1.05 1.05 0 0 1 1.5 1.5ZM15.8 16.8 18.6 14l-2.8-2.8a1.05 1.05 0 0 1 1.5-1.5l3.6 3.6a1.6 1.6 0 0 1 0 2.3l-3.6 3.6a1.05 1.05 0 0 1-1.5-1.5ZM6.2 9.2h11.6a1.15 1.15 0 0 1 0 2.3H6.2a1.15 1.15 0 0 1 0-2.3Z" />
  ),
  'chart.line.uptrend.xyaxis': (
    <path d="M4.2 4.2a1.15 1.15 0 0 1 2.3 0V18.5h13.3a1.15 1.15 0 0 1 0 2.3H5.2A2.1 2.1 0 0 1 3.1 18.7V4.2h1.1Zm14.2 3.1-4.7 4.7-2.2-2.2a1.15 1.15 0 0 0-1.7.1L6.6 13.4a1.15 1.15 0 0 0 1.7 1.5l2.4-2.7 2.3 2.3a1.15 1.15 0 0 0 1.6 0l5.5-5.5a1.15 1.15 0 0 0-1.6-1.6Z" />
  ),
  'sidebar.left': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.25" />
      <rect x="5.1" y="6" width="4.2" height="12" rx="1" fill="#fff" fillOpacity="0.35" />
    </>
  ),
  'sidebar.right': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.25" />
      <rect x="14.7" y="6" width="4.2" height="12" rx="1" fill="#fff" fillOpacity="0.35" />
    </>
  ),
};

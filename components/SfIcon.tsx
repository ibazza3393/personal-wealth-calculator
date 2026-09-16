type Name =
  | 'square.grid.2x2'
  | 'chart.bar'
  | 'link'
  | 'creditcard'
  | 'arrow.left.arrow.right'
  | 'chart.line.uptrend.xyaxis'
  | 'sidebar.left'
  | 'sidebar.right';

const PATHS: Record<Name, string> = {
  'square.grid.2x2':
    'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  'chart.bar': 'M5 19V9h3v10H5Zm6 0V5h3v14h-3Zm6 0v-7h3v7h-3Z',
  link: 'M9.5 14.5 8 16a4 4 0 0 1-5.5-5.5L4 9m10.5.5L16 8a4 4 0 0 1 5.5 5.5L20 15M8.5 12h7',
  creditcard: 'M3 7h18v10H3V7Zm0 3h18',
  'arrow.left.arrow.right': 'M7 8H3m0 0 3-3M3 8l3 3M17 16h4m0 0-3-3m3 3-3 3',
  'chart.line.uptrend.xyaxis': 'M4 19V5m0 14h16M7 14l4-4 3 2 5-6',
  'sidebar.left': 'M4 5h16v14H4V5Zm6 0v14',
  'sidebar.right': 'M4 5h16v14H4V5Zm10 0v14',
};

export function SfIcon({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

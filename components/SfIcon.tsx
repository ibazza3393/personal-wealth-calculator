import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  ChartColumn,
  ChartLine,
  CreditCard,
  LayoutGrid,
  Link2,
  PanelLeft,
  PanelRight,
} from 'lucide-react';

export type SfName =
  | 'square.grid.2x2'
  | 'chart.bar'
  | 'link'
  | 'creditcard'
  | 'arrow.left.arrow.right'
  | 'chart.line.uptrend.xyaxis'
  | 'sidebar.left'
  | 'sidebar.right';

const ICONS: Record<SfName, LucideIcon> = {
  'square.grid.2x2': LayoutGrid,
  'chart.bar': ChartColumn,
  link: Link2,
  creditcard: CreditCard,
  'arrow.left.arrow.right': ArrowLeftRight,
  'chart.line.uptrend.xyaxis': ChartLine,
  'sidebar.left': PanelLeft,
  'sidebar.right': PanelRight,
};

export function SfIcon({ name, className }: { name: SfName; className?: string }) {
  const Icon = ICONS[name];
  return (
    <Icon
      className={className}
      size={20}
      strokeWidth={1.75}
      absoluteStrokeWidth
      aria-hidden
    />
  );
}

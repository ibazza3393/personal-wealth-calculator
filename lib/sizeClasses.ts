/**
 * Layout tokens that match Apple HIG size classes — not device names.
 * SwiftUI: @Environment(\.horizontalSizeClass) → compact | regular
 *
 * compact  — iPhone portrait, iPad 1/3 Split View, Slide Over
 * regular  — iPad full screen, Mac windows, large iPhone landscape
 *
 * Sidebar only in regular width (NavigationSplitView).
 * Content uses a leading measure; the window background fills the rest
 * (HIG Layout: background extension when content does not span the window).
 */
export const SIZE = {
  compactMax: 767,
  regularMin: 768,
  sidebar: 220,
  sidebarMin: 200,
  sidebarMax: 280,
  gutter: 8,
  measure: 960,
  marginCompact: 16,
  marginRegular: 20,
} as const;

export type HorizontalSizeClass = 'compact' | 'regular';

export function horizontalSizeClass(widthPx: number): HorizontalSizeClass {
  return widthPx >= SIZE.regularMin ? 'regular' : 'compact';
}

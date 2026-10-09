// Single source of truth for the responsive behaviour required by the home dashboard brief:
// hold up from a 360px phone through a tablet and a desktop browser window, and on wide
// viewports centre the column rather than stretching a phone layout edge-to-edge.
//
// `ResponsiveContainer` (src/components/ResponsiveContainer.tsx) is the only place that reads
// `useWindowDimensions` and applies this constant - components below it receive a plain,
// already-bounded width and never branch on window size themselves.
export const layout = {
  /** The design's phone-frame content width (402px frame minus its 24px side padding x2 would
   * be 354; 480 is used instead as the column's cap on wide screens, a deliberately roomier
   * reading width than the literal device frame, chosen because 354 reads cramped once it is
   * no longer embedded in a device bezel). Below this width the column fills the viewport. */
  contentMaxWidth: 480,
  horizontalPadding: 24,
} as const;

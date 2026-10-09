import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { colors, layout } from '@/theme';

export interface ResponsiveContainerProps {
  children: ReactNode;
}

/**
 * The one place that calls `useWindowDimensions` for the dashboard. Below
 * `layout.contentMaxWidth` the column fills the viewport edge-to-edge, as on a phone. Above
 * it, the column is pinned at `layout.contentMaxWidth` and centred, with the surface colour
 * filling the margins either side - a deliberate choice for tablets and desktop browser
 * windows, instead of stretching a phone-width layout across the full window. Every
 * component below this one receives a plain, already-bounded width and never branches on
 * window size itself.
 */
export function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const isWide = width > layout.contentMaxWidth;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isWide ? colors.surface : colors.bg,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          backgroundColor: colors.bg,
          position: 'relative',
        }}
      >
        {children}
      </View>
    </View>
  );
}

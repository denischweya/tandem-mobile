import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing } from '@/theme';

export interface CardProps {
  children: ReactNode;
  backgroundColor: string;
  /** Corner radius; defaults to the reference's 28px "next plan" card radius. */
  borderRadius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

/** The reference's rounded, tinted surface (`border-radius:28px;background:var(--color-*)`).
 * Deliberately generic - no plan-specific knowledge lives here, so any future screen can wrap
 * a card around any content. See `PlanCard` for the composed, plan-specific version used on
 * this screen. */
export function Card({
  children,
  backgroundColor,
  borderRadius = radii.card,
  padding = spacing.xxl,
  style,
}: CardProps) {
  return (
    <View style={[{ backgroundColor, borderRadius, padding, gap: spacing.lg }, style]}>
      {children}
    </View>
  );
}

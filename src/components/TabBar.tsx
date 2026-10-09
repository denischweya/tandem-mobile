import type { ComponentType } from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { colors, fontSize, sizes, spacing } from '@/theme';

export interface TabBarItem {
  id: string;
  label: string;
  Icon: ComponentType<{ size: number; color: string }>;
  onPress?: () => void;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeId: string;
  /** Extra bottom padding for the home-indicator safe area on devices that have one. */
  bottomInset?: number;
  style?: ViewStyle;
}

/**
 * The reference's `.tabbar`. Only the active tab is interactive in this slice: the design
 * shows five destinations (Home, Plans, People, Groups, Profile), but only Home exists as a
 * screen in `tandem-mobile` right now, and - separately - that five-tab set does not match
 * the main navigation this project's own architecture spec calls for (Home, Plans, Calendar,
 * Notifications, Profile; see the home-dashboard report's "conflicts" section). Tabs without
 * a screen to go to are rendered as disabled rather than wired to nowhere, so VoiceOver/
 * TalkBack correctly announce them as unavailable instead of silently doing nothing on tap.
 */
export function TabBar({ items, activeId, bottomInset = 0, style }: TabBarProps) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: sizes.tabBarHeight + bottomInset,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
          paddingHorizontal: spacing.sm,
          backgroundColor: 'rgba(255,255,255,0.92)',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
        },
        style,
      ]}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const color = active ? colors.text : colors.neutral[500];
        const disabled = !item.onPress;

        return (
          <Pressable
            key={item.id}
            disabled={disabled}
            onPress={item.onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled }}
            accessibilityLabel={item.label}
            style={{
              width: 64,
              minHeight: sizes.minTouchTarget,
              alignItems: 'center',
              gap: 3,
              paddingTop: 2,
            }}
          >
            <item.Icon size={sizes.tabIcon} color={color} />
            <Text style={{ fontSize: fontSize.tabLabel, fontWeight: '500', color }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

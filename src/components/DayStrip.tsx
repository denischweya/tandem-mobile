import { Pressable, Text, View } from 'react-native';
import { colors, sizes, subStyle } from '@/theme';

export interface DayStripItem {
  id: string;
  /** "Mon", "Tue", ... */
  weekdayAbbr: string;
  /** Day-of-month number, e.g. 10. */
  dayOfMonth: number;
  selected: boolean;
}

export interface DayStripProps {
  days: DayStripItem[];
  onToggleDay: (id: string) => void;
  /** What a screen reader announces for a selected day beyond "Saturday, 10" - e.g.
   * "selected". Each day's own accessibility label is built from its `weekdayAbbr`/
   * `dayOfMonth`, so this only needs to cover the selected-state suffix. */
  selectedSuffix?: string;
}

/**
 * The reference's 7-day grid: an equal-width row of day cells where a *run* of selected days
 * merges into one continuous pill (small negative margins closing the gaps, square inner
 * corners, round outer corners) rather than seven separate rounded chips. `days` is whatever
 * 7 (or fewer) days the caller wants shown - this component has no opinion on which week or
 * which quick-choice preset produced the selection, only how to render it.
 *
 * Each cell is already taller than the 44pt touch-target floor (hard constraint #5) once its
 * vertical padding is included, so no `hitSlop` top-up is needed here.
 */
export function DayStrip({ days, onToggleDay, selectedSuffix = 'selected' }: DayStripProps) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {days.map((day, index) => {
        const prevSelected = days[index - 1]?.selected ?? false;
        const nextSelected = days[index + 1]?.selected ?? false;
        const roundLeft = !day.selected || !prevSelected;
        const roundRight = !day.selected || !nextSelected;
        const pillRadius = 999;

        return (
          <Pressable
            key={day.id}
            onPress={() => onToggleDay(day.id)}
            accessibilityRole="button"
            accessibilityLabel={`${day.weekdayAbbr} ${day.dayOfMonth}${day.selected ? `, ${selectedSuffix}` : ''}`}
            accessibilityState={{ selected: day.selected }}
            style={{
              flex: 1,
              minHeight: sizes.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              marginHorizontal: day.selected ? -4 : 0,
              backgroundColor: day.selected ? colors.accent[500] : 'transparent',
              borderTopLeftRadius: roundLeft ? pillRadius : 0,
              borderBottomLeftRadius: roundLeft ? pillRadius : 0,
              borderTopRightRadius: roundRight ? pillRadius : 0,
              borderBottomRightRadius: roundRight ? pillRadius : 0,
              zIndex: day.selected ? 1 : 0,
            }}
          >
            <Text
              style={[
                subStyle,
                {
                  fontSize: 11,
                  color: day.selected ? colors.bg : colors.neutral[600],
                  opacity: day.selected ? 0.7 : 1,
                },
              ]}
            >
              {day.weekdayAbbr}
            </Text>
            <Text
              style={{
                fontWeight: '600',
                color: day.selected ? colors.bg : colors.neutral[500],
              }}
            >
              {day.dayOfMonth}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

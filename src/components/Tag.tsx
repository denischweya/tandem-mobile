import { Text, View } from 'react-native';
import { colors, fontSize, radii, sizes } from '@/theme';

export type TagTone = 'accent' | 'accent2';

export interface TagProps {
  label: string;
  tone: TagTone;
}

/**
 * A small status pill ("Voting · closes Thu 6 PM" on screen 3e, "Confirmed" on screen 3g).
 * The reference's markup for both screens references a `tag`/`tag-accent`/`tag-accent-2`
 * class that the shared component CSS handed to earlier agents never actually defines (it
 * only ever appears on these two screens) - there is no existing primitive to extend, so this
 * is new. Deliberately minimal: a tinted pill with bold text, no interaction of its own.
 *
 * Not hidden from assistive tech - unlike the decorative leading dot on `ListRow`, this pill
 * carries information ("closes Thu 6 PM") that is not repeated anywhere else on the screen, so
 * it must be read, not swallowed as decoration.
 */
export function Tag({ label, tone }: TagProps) {
  const backgroundColor = tone === 'accent' ? colors.accent[100] : colors.accent2[100];
  const color = tone === 'accent' ? colors.accent[800] : colors.accent2[800];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: sizes.tagHeight,
        paddingHorizontal: 12,
        borderRadius: radii.pill,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: fontSize.caption, fontWeight: '600', color }}>{label}</Text>
    </View>
  );
}

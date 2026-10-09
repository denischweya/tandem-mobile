import { View, Text, type ViewStyle } from 'react-native';

// The design reference draws every icon as an inline SVG `<path>`. This project has no SVG
// renderer installed (no `react-native-svg` in package.json), and the task that produced this
// screen does not authorize adding a dependency beyond `react-native-web` - so every icon
// here is built from plain `View`/`Text` primitives (borders, rotation, Unicode glyphs)
// instead of redrawing the reference's vector paths. They are deliberately simplified: close
// enough to read as "chevron", "plus", "check" and the five tab glyphs at a glance, not
// pixel-faithful reproductions of the source SVGs. Every icon here is decorative - the
// components that place them are responsible for the real accessibility label.

interface IconProps {
  size: number;
  color: string;
}

/** `>` chevron, via the classic two-border-sides-rotated-45deg trick. */
export function ChevronRightIcon({ size, color }: IconProps) {
  const arm = size * 0.5;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: arm,
          height: arm,
          borderTopWidth: 2.5,
          borderRightWidth: 2.5,
          borderTopColor: color,
          borderRightColor: color,
          transform: [{ rotate: '45deg' }, { translateX: -size * 0.08 }],
        }}
      />
    </View>
  );
}

/** Checkmark glyph. A Unicode character renders consistently enough for a small decorative
 * mark sitting directly beside its own text label ("In your calendar"). */
export function CheckIcon({ size, color }: IconProps) {
  return <Text style={{ fontSize: size, lineHeight: size, color, fontWeight: '700' }}>{'✓'}</Text>;
}

/** `+` glyph for the "Make a plan" floating button. */
export function PlusIcon({ size, color }: IconProps) {
  const thickness = 2.75;
  const common: ViewStyle = { position: 'absolute', backgroundColor: color, borderRadius: 2 };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[common, { left: 0, top: size / 2 - thickness / 2, width: size, height: thickness }]}
      />
      <View
        style={[common, { top: 0, left: size / 2 - thickness / 2, height: size, width: thickness }]}
      />
    </View>
  );
}

function Circle({ size, color, style }: IconProps & { style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2.25,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export function HomeTabIcon({ size, color }: IconProps) {
  const roof = size * 0.56;
  const body = size * 0.62;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: roof,
          height: roof,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: 3,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: body,
          height: size * 0.42,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: 3,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}

export function PlansTabIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.82,
          height: size * 0.7,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{ width: size * 0.3, height: size * 0.3, borderRadius: 1, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export function PeopleTabIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Circle
        size={size * 0.42}
        color={color}
        style={{ position: 'absolute', left: size * 0.08, top: size * 0.08 }}
      />
      <Circle
        size={size * 0.42}
        color={color}
        style={{ position: 'absolute', left: size * 0.42, top: size * 0.3 }}
      />
    </View>
  );
}

export function GroupsTabIcon({ size, color }: IconProps) {
  const dot = size * 0.36;
  return (
    <View style={{ width: size, height: size }}>
      <Circle
        size={dot}
        color={color}
        style={{ position: 'absolute', left: size * 0.08, top: size * 0.1 }}
      />
      <Circle
        size={dot}
        color={color}
        style={{ position: 'absolute', left: size * 0.56, top: size * 0.1 }}
      />
      <Circle
        size={dot}
        color={color}
        style={{ position: 'absolute', left: size * 0.32, top: size * 0.52 }}
      />
    </View>
  );
}

export function ProfileTabIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', overflow: 'hidden' }}>
      <Circle size={size * 0.42} color={color} style={{ marginTop: size * 0.02 }} />
      <View
        style={{
          marginTop: size * 0.06,
          width: size * 0.78,
          height: size * 0.5,
          borderRadius: size * 0.4,
          borderWidth: 2.25,
          borderColor: color,
        }}
      />
    </View>
  );
}

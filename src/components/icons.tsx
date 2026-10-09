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

/** `<` chevron - the mirror of `ChevronRightIcon`, used as the step-flow "back" affordance on
 * screens 3c/3d. Same two-border-sides-rotated trick, flipped to the opposite corner. */
export function ChevronLeftIcon({ size, color }: IconProps) {
  const arm = size * 0.5;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: arm,
          height: arm,
          borderBottomWidth: 2.5,
          borderLeftWidth: 2.5,
          borderBottomColor: color,
          borderLeftColor: color,
          transform: [{ rotate: '45deg' }, { translateX: size * 0.08 }],
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

/** `x` glyph for the step-flow's "close/dismiss the whole flow" affordance (screen 3b's header).
 * Two bars crossed at +45/-45deg - the rotated sibling of `PlusIcon`'s two-bar technique. */
export function CloseIcon({ size, color }: IconProps) {
  const thickness = 2.75;
  const length = size * 0.78;
  const common: ViewStyle = {
    position: 'absolute',
    top: size / 2 - thickness / 2,
    left: size / 2 - length / 2,
    width: length,
    height: thickness,
    borderRadius: 2,
    backgroundColor: color,
  };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[common, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[common, { transform: [{ rotate: '-45deg' }] }]} />
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

/** Chain-link glyph for the 3b "invite via link" action - two overlapping rings, the same
 * two-`Circle`-offset technique `PeopleTabIcon` already uses below, just rotated onto the
 * diagonal so the pair reads as a link rather than two people. */
export function LinkIcon({ size, color }: IconProps) {
  const ring = size * 0.56;
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '45deg' }] }}>
      <Circle
        size={ring}
        color={color}
        style={{ position: 'absolute', left: size * 0.06, top: size * 0.06 }}
      />
      <Circle
        size={ring}
        color={color}
        style={{ position: 'absolute', left: size * 0.38, top: size * 0.38 }}
      />
    </View>
  );
}

/** Calendar glyph for the 3c "calendars this plan draws from" row: an outlined body, a
 * header divider, and two small ring ticks - simplified, not a pixel-faithful redraw of the
 * reference's rect+path SVG. */
export function CalendarGlyphIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.18,
          left: 0,
          width: size,
          height: size * 0.82,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.42,
          left: 0,
          width: size,
          height: 2.25,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.22,
          width: 2.25,
          height: size * 0.3,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.7,
          width: 2.25,
          height: size * 0.3,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Padlock glyph for the 3d privacy footnote ("Only free, maybe or busy is shared") - a
 * rounded body plus a shackle arc, built from borders rather than the reference's SVG path. */
export function LockIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: size * 0.56,
          height: size * 0.56,
          borderWidth: 2.25,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: size * 0.86,
          height: size * 0.56,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </View>
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

/** Three-dot "overflow menu" glyph for screen 3e's header. Decorative only - there is no
 * overflow menu behind it in this slice (see `VotingScreen`'s header comment), the same
 * "render disabled, not wired to nowhere" treatment `TabBar` already uses. */
export function MoreHorizontalIcon({ size, color }: IconProps) {
  const dot = size * 0.15;
  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {[0, 1, 2].map((key) => (
        <View
          key={key}
          style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

/** Upload/share glyph (an arrow into a tray) for screen 3g's header. Simplified, not a
 * pixel-faithful redraw of the reference's path - same approach as every other icon here. */
export function ShareIcon({ size, color }: IconProps) {
  const arm = size * 0.3;
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: 2.25,
          height: size * 0.46,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          width: arm,
          height: arm,
          borderTopWidth: 2.25,
          borderLeftWidth: 2.25,
          borderTopColor: color,
          borderLeftColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: size,
          height: size * 0.34,
          borderWidth: 2.25,
          borderTopWidth: 0,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

/** Speech-bubble glyph for screen 3g's header. A rounded body plus a small tail, built from
 * borders rather than the reference's SVG path. */
export function ChatIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size * 0.74,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: size * 0.4,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.08,
          left: size * 0.2,
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** Attachment-clip glyph for screen 3e's chat composer. A single rounded-rect ring rotated
 * onto the diagonal - a deliberately simplified stand-in for the reference's paperclip path
 * (the same "reads as the thing at a glance, not pixel-faithful" rule every icon here follows). */
export function PaperclipIcon({ size, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.38,
          height: size * 0.78,
          borderWidth: 2.25,
          borderColor: color,
          borderRadius: size * 0.19,
          transform: [{ rotate: '40deg' }],
        }}
      />
    </View>
  );
}

/** Filled warning-triangle glyph for screen 3g's "Couldn't add to Work" sync-failure card
 * (hard constraint #4: the failure must be visibly flagged, not just worded). A solid
 * CSS-border triangle with a cut-out exclamation mark, rather than the reference's outlined
 * SVG path - the cut-out needs a colour that contrasts with the solid fill, so this one icon
 * takes that contrast colour as a third prop instead of reusing the plain two-prop shape. */
export function WarningIcon({ size, color, markColor }: IconProps & { markColor: string }) {
  const triangle = size * 0.92;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: 0,
          height: 0,
          borderLeftWidth: triangle / 2,
          borderRightWidth: triangle / 2,
          borderBottomWidth: triangle * 0.86,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.4,
          width: 2.5,
          height: size * 0.18,
          borderRadius: 1.5,
          backgroundColor: markColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.16,
          width: 2.5,
          height: 2.5,
          borderRadius: 1.5,
          backgroundColor: markColor,
        }}
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

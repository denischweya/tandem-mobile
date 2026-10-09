import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  Chip,
  IconButton,
  LinkIcon,
  ResponsiveContainer,
  SelectCircle,
  StepHeader,
} from '@/components';
import { colors, headingStyle, spacing, subStyle } from '@/theme';
import { PEOPLE, PLAN_CATEGORIES, SAVED_GROUPS } from './fixtures';
import { usePlanDraftStore } from './planDraftStore';

export interface WhatWhoScreenProps {
  onBack: () => void;
  onNext: () => void;
}

/** A person's role, surfaced as the same small caption the reference draws under their name. */
function roleCaption(role: 'required' | 'optional' | 'guest'): { text: string; tone?: 'accent' } {
  switch (role) {
    case 'required':
      return { text: 'Required' };
    case 'guest':
      return { text: 'Guest · joins by link, no app needed' };
    case 'optional':
      return { text: "Optional · won't block a time", tone: 'accent' };
  }
}

/**
 * Screen 3b: "Make a plan, step 1: what + who". A category chooser, a plan-name field (both
 * required), and a "Who's coming?" chooser over saved groups, each rendered as the group's
 * own members, individually toggle-able (optional members only - see `SelectCircle`'s doc
 * comment on why required/guest rows are locked). "Alongside individual people" from the
 * task brief is read here as: the per-person checklist below the group chips *is* the
 * individual view - there is no separate "add one person" search field in the transcribed
 * reference to build without inventing a control nothing calls (see the make-a-plan report's
 * ambiguity section).
 */
export function WhatWhoScreen({ onBack, onNext }: WhatWhoScreenProps) {
  const insets = useSafeAreaInsets();
  const categoryId = usePlanDraftStore((s) => s.categoryId);
  const planName = usePlanDraftStore((s) => s.planName);
  const selectedGroupId = usePlanDraftStore((s) => s.selectedGroupId);
  const attendees = usePlanDraftStore((s) => s.attendees);
  const setCategory = usePlanDraftStore((s) => s.setCategory);
  const setPlanName = usePlanDraftStore((s) => s.setPlanName);
  const selectGroup = usePlanDraftStore((s) => s.selectGroup);
  const toggleOptionalAttendee = usePlanDraftStore((s) => s.toggleOptionalAttendee);

  const [nameTouched, setNameTouched] = useState(false);

  const includedCount = attendees.filter((a) => a.included).length;
  const nameIsEmpty = planName.trim().length === 0;

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.xxxl,
          paddingBottom: spacing.huge,
        }}
      >
        <StepHeader leadingIcon="close" onLeadingPress={onBack} totalSteps={3} completedSteps={1} />

        <View style={{ gap: spacing.lg }}>
          <Text accessibilityRole="header" style={headingStyle(32)}>
            What are you planning?
          </Text>

          <View style={{ gap: 4 }}>
            <TextInput
              value={planName}
              onChangeText={setPlanName}
              onBlur={() => setNameTouched(true)}
              placeholder="Plan name"
              placeholderTextColor={colors.neutral[500]}
              accessibilityLabel="Plan name, required"
              style={{
                height: 52,
                borderRadius: 999,
                backgroundColor: colors.neutral[100],
                paddingHorizontal: spacing.xxl,
                fontSize: 17,
                fontWeight: '500',
                color: colors.text,
              }}
            />
            {nameTouched && nameIsEmpty ? (
              <Text
                style={[subStyle, { color: colors.accent[700], paddingHorizontal: spacing.sm }]}
              >
                A plan name is required.
              </Text>
            ) : null}
          </View>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="What are you planning?"
            style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}
          >
            {PLAN_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={category.label}
                selected={category.id === categoryId}
                onPress={() => setCategory(category.id)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          <Text accessibilityRole="header" style={headingStyle(26)}>
            {"Who's coming?"}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityRole="radiogroup"
            accessibilityLabel="Saved groups"
            contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm }}
          >
            {SAVED_GROUPS.map((group) => (
              <Chip
                key={group.id}
                label={`${group.name} · ${group.members.length}`}
                accessibilityLabel={`${group.name}, ${group.members.length} people`}
                selected={group.id === selectedGroupId}
                onPress={() => selectGroup(group.id)}
              />
            ))}
          </ScrollView>

          <View>
            {attendees.map((attendee) => {
              const person = PEOPLE[attendee.personId];
              if (!person) return null;
              const caption = roleCaption(attendee.role);
              const isOptional = attendee.role === 'optional';

              return (
                <View
                  key={attendee.personId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: spacing.md,
                  }}
                >
                  <Avatar
                    label={person.initials}
                    backgroundColor={person.avatarColor}
                    textColor={person.avatarTextColor}
                    decorative
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontWeight: '600', color: colors.text }}>
                      {person.firstName}
                    </Text>
                    <Text
                      style={[
                        subStyle,
                        caption.tone === 'accent' ? { color: colors.accent[700] } : null,
                      ]}
                    >
                      {caption.text}
                    </Text>
                  </View>
                  <SelectCircle
                    checked={attendee.included}
                    tone={isOptional ? 'muted' : 'accent'}
                    onPress={
                      isOptional ? () => toggleOptionalAttendee(attendee.personId) : undefined
                    }
                    accessibilityLabel={`${person.firstName}, ${caption.text}${
                      attendee.included ? ', included' : ', excluded'
                    }`}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.md,
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingTop: spacing.md,
        }}
      >
        <IconButton
          icon={<LinkIcon size={20} color={colors.accent2[700]} />}
          variant="secondary"
          // No invite-link backend exists yet to generate a real link for (same "mocked, not
          // invented" situation as every other data-backed action in this slice) - see the
          // make-a-plan report's ambiguity section.
          onPress={() => {}}
          accessibilityLabel="Copy invite link"
        />
        <Button
          label={`Next · ${includedCount} ${includedCount === 1 ? 'person' : 'people'}`}
          onPress={onNext}
          style={{ flex: 1 }}
          accessibilityLabel={`Next, ${includedCount} ${includedCount === 1 ? 'person' : 'people'} invited`}
        />
      </View>
    </ResponsiveContainer>
  );
}

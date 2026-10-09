import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  AvatarGroup,
  ChevronLeftIcon,
  Chip,
  MoreHorizontalIcon,
  PaperclipIcon,
  ResponsiveContainer,
  Tag,
  type AvatarGroupMember,
} from '@/components';
import { colors, labelStyle, sizes, spacing, subStyle, headingStyle } from '@/theme';
import { formatHourLabel, formatPlanDate, formatVotingDeadline } from '../home/formatting';
import {
  INITIAL_VOTES,
  VOTING_CANDIDATES,
  VOTING_CHAT,
  VOTING_CLOSES_AT,
  VOTING_PEOPLE,
  VOTING_PEOPLE_IDS,
  VOTING_PLAN,
  VOTING_SHARED_ITEMS_PREVIEW,
  VOTING_SHARED_ITEMS_TOTAL,
  VOTING_TIME_ZONE,
  VOTING_VIEWER_ID,
  type VoteEntry,
  type VotingPerson,
} from './fixtures';
import {
  castVote,
  countCompletedVoters,
  describeVoteChoice,
  formatVotingSummary,
  respondersForCandidate,
  viewerVoteFor,
} from './voting';

export interface VotingScreenProps {
  onBack: () => void;
}

const CANDIDATE_IDS = VOTING_CANDIDATES.map((candidate) => candidate.id);
const VOTE_CHOICES = ['free', 'maybe', 'busy'] as const;
const VOTE_GLYPH: Record<(typeof VOTE_CHOICES)[number], string> = {
  free: '✓',
  maybe: '?',
  busy: '✕',
};

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Screen 3e: "Plan while voting" - a plan mid-decision: your votes on candidate times, then
 * the group's chat and shared files. Reached from the make-a-plan flow's "Let everyone vote"
 * (screen 3d, `app/make-a-plan/best-times.tsx`) via `app/plan/voting.tsx`.
 *
 * There is no voting-poll backend to turn whatever the user just drafted in 3b/3c into a real
 * poll - this renders the reference's own "Football" worked example instead of a live
 * transformation of the draft (same "mocked, not invented" rule as every other screen in this
 * app; see `fixtures.ts`'s header comment for the full reasoning).
 *
 * Privacy invariant (hard constraint #2): the avatar stack under each candidate shows *who*
 * has responded to that slot - identity only, via `respondersForCandidate` - never *what* they
 * voted. Only the viewer's own vote (the three chips) is ever shown as a value, and that
 * value is always one of free/maybe/busy, never a reason (blueprint §154).
 */
export function VotingScreen({ onBack }: VotingScreenProps) {
  const insets = useSafeAreaInsets();
  const [votes, setVotes] = useState<VoteEntry[]>(INITIAL_VOTES);
  const [draftMessage, setDraftMessage] = useState('');

  const votedCount = countCompletedVoters(votes, VOTING_PEOPLE_IDS, CANDIDATE_IDS);

  return (
    <ResponsiveContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.xxl,
          paddingBottom: spacing.xl,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            hitSlop={8}
            style={{
              minWidth: sizes.minTouchTarget,
              minHeight: sizes.minTouchTarget,
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={sizes.flowHeaderIcon} color={colors.text} />
          </Pressable>
          {/* No overflow menu exists in this slice - rendered disabled rather than wired to
              nowhere, the same treatment `TabBar` already uses for its own unimplemented
              destinations. */}
          <Pressable
            disabled
            accessibilityRole="button"
            accessibilityLabel="More options"
            accessibilityState={{ disabled: true }}
            style={{
              minWidth: sizes.minTouchTarget,
              minHeight: sizes.minTouchTarget,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <MoreHorizontalIcon size={sizes.flowHeaderIcon} color={colors.neutral[400]} />
          </Pressable>
        </View>

        <View style={{ gap: 6 }}>
          <Tag
            tone="accent"
            label={`Voting · closes ${formatVotingDeadline(VOTING_CLOSES_AT, VOTING_TIME_ZONE)}`}
          />
          <Text accessibilityRole="header" style={headingStyle(34)}>
            {VOTING_PLAN.title}
          </Text>
          <Text style={subStyle}>
            {VOTING_PLAN.groupName} · {VOTING_PLAN.locationLabel} ·{' '}
            {formatVotingSummary(votedCount, VOTING_PEOPLE_IDS.length)}
          </Text>
        </View>

        <View>
          {VOTING_CANDIDATES.map((candidate) => {
            const responderIds = respondersForCandidate(votes, candidate.id, VOTING_VIEWER_ID);
            const viewerChoice = viewerVoteFor(votes, VOTING_VIEWER_ID, candidate.id);
            const dateLabel = `${formatPlanDate(candidate.start, candidate.timeZone)} · ${formatHourLabel(
              candidate.start,
              candidate.timeZone,
            )}`;

            const responderPeople: VotingPerson[] = responderIds
              .map((id) => VOTING_PEOPLE[id])
              .filter(isDefined);
            const responderMembers: AvatarGroupMember[] = responderPeople.map((person) => ({
              id: person.id,
              label: person.initials,
              backgroundColor: person.avatarColor,
              textColor: person.avatarTextColor,
            }));

            return (
              <View
                key={candidate.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>{dateLabel}</Text>
                  {responderPeople.length > 0 ? (
                    <AvatarGroup
                      members={responderMembers}
                      size={22}
                      accessibilityLabel={`${responderPeople
                        .map((person) => person.firstName)
                        .join(', ')} voted`}
                    />
                  ) : (
                    <Text style={subStyle}>No votes yet</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {VOTE_CHOICES.map((choice) => {
                    const { label, color } = describeVoteChoice(choice);
                    const selected = viewerChoice === choice;
                    return (
                      <Chip
                        key={choice}
                        label={VOTE_GLYPH[choice]}
                        selected={selected}
                        size={sizes.voteChipSize}
                        activeBackgroundColor={color}
                        activeTextColor={choice === 'maybe' ? colors.accent[900] : colors.bg}
                        onPress={() =>
                          setVotes((current) =>
                            castVote(current, VOTING_VIEWER_ID, candidate.id, choice),
                          )
                        }
                        accessibilityLabel={`Vote ${label.toLowerCase()} for ${dateLabel}`}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={labelStyle}>Shared</Text>
            <Text style={[subStyle, { fontSize: 13 }]}>{VOTING_SHARED_ITEMS_TOTAL} items</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm }}
          >
            {VOTING_SHARED_ITEMS_PREVIEW.map((item) => (
              <View
                key={item.id}
                style={{
                  height: sizes.chipHeight,
                  paddingHorizontal: spacing.xl,
                  borderRadius: 999,
                  backgroundColor: colors.neutral[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text }}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={labelStyle}>Chat</Text>
          {VOTING_CHAT.map((message) => {
            const isViewer = message.authorId === VOTING_VIEWER_ID;
            const author = VOTING_PEOPLE[message.authorId];

            if (isViewer) {
              return (
                <View
                  key={message.id}
                  accessible
                  accessibilityLabel={`You: ${message.text}`}
                  style={{
                    alignSelf: 'flex-end',
                    maxWidth: '75%',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderBottomRightRadius: 6,
                    backgroundColor: colors.text,
                  }}
                >
                  <Text style={{ color: colors.bg, fontSize: 14 }}>{message.text}</Text>
                </View>
              );
            }

            return (
              <View
                key={message.id}
                style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}
              >
                <Avatar
                  label={author?.initials ?? '?'}
                  size={26}
                  backgroundColor={author?.avatarColor ?? colors.neutral[300]}
                  textColor={author?.avatarTextColor}
                  decorative
                />
                <View
                  accessible
                  accessibilityLabel={`${author?.firstName ?? 'Someone'}: ${message.text}`}
                  style={{
                    maxWidth: '75%',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderBottomLeftRadius: 6,
                    backgroundColor: colors.neutral[100],
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.text }}>{message.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.xxl,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <TextInput
          value={draftMessage}
          onChangeText={setDraftMessage}
          placeholder={`Message ${VOTING_PLAN.groupName}`}
          placeholderTextColor={colors.neutral[500]}
          accessibilityLabel={`Message ${VOTING_PLAN.groupName}`}
          style={{
            flex: 1,
            height: 46,
            borderRadius: 999,
            backgroundColor: colors.neutral[100],
            paddingHorizontal: spacing.xl,
            fontSize: 15,
            color: colors.text,
          }}
        />
        <Pressable
          // No chat-attachment backend exists in this slice - same no-op convention as 3b's
          // "Copy invite link" button (`WhatWhoScreen.tsx`).
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Attach a file"
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            backgroundColor: colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PaperclipIcon size={20} color={colors.text} />
        </Pressable>
      </View>
    </ResponsiveContainer>
  );
}

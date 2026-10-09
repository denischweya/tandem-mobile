import { describeAvailability, type Availability } from '@/components';
import type { VoteEntry } from './fixtures';

// Screen 3e's vote-tallying logic. Kept pure and framework-free so it is testable without
// rendering anything - the same split `ranking.ts` already uses for screen 3d.
//
// This reuses `Availability` ('free'/'maybe'/'busy') as the vote value rather than inventing
// a parallel 'yes'/'maybe'/'no' enum: a vote on a candidate time *is* a self-reported
// availability for that slot. Reusing the type means every colour this screen shows comes
// from the one, already-audited `describeAvailability` mapping - which is what keeps the
// "declined" vote's colour from drifting away from `StatusDot`'s busy-grey (hard constraint
// #1: "never colour alone"). The transcribed reference's own markup, read literally, gives
// the "no" chip no colour override of its own, so it falls back to the generic `.chip.on`
// purple - the same purple the "yes" chip uses. Implementing that literally would make two
// opposite answers share one colour, which is exactly what the invariant forbids; this module
// deliberately deviates from the literal markup in favour of the written rule (see the
// report's ambiguity note).
//
// Privacy invariant (blueprint §136/§154, hard constraint #2): nothing here goes further than
// a free/maybe/busy word for any person, viewer included - there is no field anywhere in this
// module that could carry a reason.

/**
 * "Yes"/"Maybe"/"No" - the vote-specific word for each availability value, paired with
 * `describeAvailability`'s own colour so the vote chip can never show a colour `StatusDot`
 * wouldn't also show for the same status.
 */
export function describeVoteChoice(choice: Availability): { label: string; color: string } {
  const label = choice === 'free' ? 'Yes' : choice === 'maybe' ? 'Maybe' : 'No';
  return { label, color: describeAvailability(choice).color };
}

/**
 * True once `personId` has cast a vote for every candidate in `candidateIds` - "done
 * voting", the semantic screen 3e's "N of M voted" header counts.
 */
export function hasCompletedVoting(
  votes: VoteEntry[],
  personId: string,
  candidateIds: string[],
): boolean {
  return candidateIds.every((candidateId) =>
    votes.some((vote) => vote.personId === personId && vote.candidateId === candidateId),
  );
}

/** How many of `peopleIds` have completed voting (see `hasCompletedVoting`) - the numerator
 * of "N of M voted". */
export function countCompletedVoters(
  votes: VoteEntry[],
  peopleIds: string[],
  candidateIds: string[],
): number {
  return peopleIds.filter((personId) => hasCompletedVoting(votes, personId, candidateIds)).length;
}

/** "3 of 5 voted". */
export function formatVotingSummary(completed: number, total: number): string {
  return `${completed} of ${total} voted`;
}

/**
 * Distinct people (identity only, never their vote value - hard constraint #2) who have cast
 * *any* vote for `candidateId`, excluding `excludePersonId` (the viewer, whose own vote is
 * shown separately via the chip row, not folded into this "who else has responded" list).
 */
export function respondersForCandidate(
  votes: VoteEntry[],
  candidateId: string,
  excludePersonId: string,
): string[] {
  const ids = new Set<string>();
  for (const vote of votes) {
    if (vote.candidateId === candidateId && vote.personId !== excludePersonId) {
      ids.add(vote.personId);
    }
  }
  return Array.from(ids);
}

/** `personId`'s own vote for `candidateId`, or `undefined` if they haven't voted on it yet. */
export function viewerVoteFor(
  votes: VoteEntry[],
  personId: string,
  candidateId: string,
): Availability | undefined {
  return votes.find((vote) => vote.personId === personId && vote.candidateId === candidateId)
    ?.choice;
}

/**
 * Immutably replaces `personId`'s vote for `candidateId` with `choice` (inserting one if none
 * exists yet). Never mutates `votes`, and never leaves two entries for the same
 * person+candidate pair behind.
 */
export function castVote(
  votes: VoteEntry[],
  personId: string,
  candidateId: string,
  choice: Availability,
): VoteEntry[] {
  const withoutExisting = votes.filter(
    (vote) => !(vote.personId === personId && vote.candidateId === candidateId),
  );
  return [...withoutExisting, { personId, candidateId, choice }];
}

import { colors } from '@/theme';
import type { VoteEntry } from './fixtures';
import {
  castVote,
  countCompletedVoters,
  describeVoteChoice,
  formatVotingSummary,
  hasCompletedVoting,
  respondersForCandidate,
  viewerVoteFor,
} from './voting';

const CANDIDATES = ['a', 'b', 'c'];

// Mirrors the shape of the real fixture: three people who have gone through all three
// candidates (denis/sarah/james), and two who have only responded to one each (mike/kofi).
const VOTES: VoteEntry[] = [
  { personId: 'denis', candidateId: 'a', choice: 'free' },
  { personId: 'denis', candidateId: 'b', choice: 'maybe' },
  { personId: 'denis', candidateId: 'c', choice: 'busy' },
  { personId: 'sarah', candidateId: 'a', choice: 'free' },
  { personId: 'sarah', candidateId: 'b', choice: 'free' },
  { personId: 'sarah', candidateId: 'c', choice: 'maybe' },
  { personId: 'james', candidateId: 'a', choice: 'free' },
  { personId: 'james', candidateId: 'b', choice: 'busy' },
  { personId: 'james', candidateId: 'c', choice: 'busy' },
  { personId: 'mike', candidateId: 'a', choice: 'maybe' },
];

describe('describeVoteChoice', () => {
  it('maps free to "Yes", using describeAvailability\'s own colour', () => {
    expect(describeVoteChoice('free')).toEqual({ label: 'Yes', color: colors.accent2[500] });
  });

  it('maps maybe to "Maybe"', () => {
    expect(describeVoteChoice('maybe')).toEqual({ label: 'Maybe', color: colors.accent[300] });
  });

  it('maps busy to "No"', () => {
    expect(describeVoteChoice('busy')).toEqual({ label: 'No', color: colors.neutral[400] });
  });

  it('gives each of the three vote choices a distinct colour (hard constraint #1)', () => {
    const used = (['free', 'maybe', 'busy'] as const).map(
      (choice) => describeVoteChoice(choice).color,
    );
    expect(new Set(used).size).toBe(3);
  });
});

describe('hasCompletedVoting', () => {
  it('is true once a person has a vote entry for every candidate', () => {
    expect(hasCompletedVoting(VOTES, 'denis', CANDIDATES)).toBe(true);
    expect(hasCompletedVoting(VOTES, 'sarah', CANDIDATES)).toBe(true);
  });

  it('is false for a person missing a vote on any candidate', () => {
    expect(hasCompletedVoting(VOTES, 'mike', CANDIDATES)).toBe(false);
  });

  it('is false for a person with no votes at all', () => {
    expect(hasCompletedVoting(VOTES, 'kofi', CANDIDATES)).toBe(false);
  });
});

describe('countCompletedVoters', () => {
  it('counts exactly the people who have voted on every candidate ("3 of 5")', () => {
    expect(
      countCompletedVoters(VOTES, ['denis', 'sarah', 'james', 'mike', 'kofi'], CANDIDATES),
    ).toBe(3);
  });

  it('is zero when nobody has completed every candidate', () => {
    expect(countCompletedVoters(VOTES, ['mike', 'kofi'], CANDIDATES)).toBe(0);
  });
});

describe('formatVotingSummary', () => {
  it('renders "3 of 5 voted"', () => {
    expect(formatVotingSummary(3, 5)).toBe('3 of 5 voted');
  });
});

describe('respondersForCandidate', () => {
  it('returns distinct responders excluding the given person, identity only', () => {
    expect(respondersForCandidate(VOTES, 'a', 'denis').sort()).toEqual(['james', 'mike', 'sarah']);
  });

  it('excludes the viewer even when the viewer has voted on that candidate', () => {
    const responders = respondersForCandidate(VOTES, 'c', 'denis');
    expect(responders).not.toContain('denis');
    expect(responders.sort()).toEqual(['james', 'sarah']);
  });

  it('returns an empty list when nobody but the excluded person has responded', () => {
    expect(respondersForCandidate(VOTES, 'a', 'kofi').sort()).toEqual([
      'denis',
      'james',
      'mike',
      'sarah',
    ]);
    expect(respondersForCandidate([], 'a', 'denis')).toEqual([]);
  });
});

describe('viewerVoteFor', () => {
  it("returns the person's own vote for a candidate", () => {
    expect(viewerVoteFor(VOTES, 'denis', 'b')).toBe('maybe');
  });

  it('returns undefined when the person has not voted on that candidate', () => {
    expect(viewerVoteFor(VOTES, 'mike', 'b')).toBeUndefined();
  });
});

describe('castVote', () => {
  it('inserts a new vote without touching existing ones', () => {
    const next = castVote(VOTES, 'kofi', 'a', 'free');
    expect(next).toHaveLength(VOTES.length + 1);
    expect(viewerVoteFor(next, 'kofi', 'a')).toBe('free');
    expect(viewerVoteFor(next, 'denis', 'a')).toBe('free');
  });

  it('replaces an existing vote for the same person+candidate rather than duplicating it', () => {
    const next = castVote(VOTES, 'denis', 'a', 'busy');
    expect(
      next.filter((vote) => vote.personId === 'denis' && vote.candidateId === 'a'),
    ).toHaveLength(1);
    expect(viewerVoteFor(next, 'denis', 'a')).toBe('busy');
  });

  it('does not mutate the input array', () => {
    const before = VOTES.length;
    castVote(VOTES, 'kofi', 'b', 'maybe');
    expect(VOTES).toHaveLength(before);
  });
});

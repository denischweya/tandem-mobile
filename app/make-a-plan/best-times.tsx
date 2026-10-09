import { useRouter } from 'expo-router';
import { BestTimesScreen } from '@/features/makeAPlan/BestTimesScreen';
import { usePlanDraftStore } from '@/features/makeAPlan/planDraftStore';

/**
 * Screen 3d - the make-a-plan flow's last step. Both of its actions now have a real
 * destination (screens 3e and 3f, under `app/plan/`), closing the dead end this screen used
 * to have: "Confirm" used to call `router.dismissTo('/')` directly because no confirm screen
 * existed; "Let everyone vote" did the exact same thing for the same reason.
 *
 * "Confirm" records which candidate the user actually picked (`setConfirmedSlot`) before
 * navigating, so screen 3f (`/plan/confirm`) renders that slot rather than always assuming
 * the top-ranked one. "Let everyone vote" needs no such hand-off - screen 3e renders its own
 * independent mocked poll (see `VotingScreen`'s header comment).
 */
export default function MakeAPlanBestTimes() {
  const router = useRouter();
  const setConfirmedSlot = usePlanDraftStore((s) => s.setConfirmedSlot);

  return (
    <BestTimesScreen
      onBack={() => router.back()}
      onConfirm={(slotId) => {
        setConfirmedSlot(slotId);
        router.push('/plan/confirm');
      }}
      onVote={() => router.push('/plan/voting')}
    />
  );
}

import { useRouter } from 'expo-router';
import { VotingScreen } from '@/features/planLifecycle/VotingScreen';

/**
 * Screen 3e - reached from the make-a-plan flow's "Let everyone vote" (screen 3d,
 * `app/make-a-plan/best-times.tsx`). Its back chevron returns to Home: once a user has
 * committed to "let everyone vote" there is nowhere within the finished wizard worth going
 * "back" into, so this dismisses the whole stack the same way screen 3d's own two actions
 * used to (`router.dismissTo('/')`) before this screen existed to dismiss *to*.
 */
export default function PlanVoting() {
  const router = useRouter();
  return <VotingScreen onBack={() => router.dismissTo('/')} />;
}

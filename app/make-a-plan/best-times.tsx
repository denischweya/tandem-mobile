import { useRouter } from 'expo-router';
import { BestTimesScreen } from '@/features/makeAPlan/BestTimesScreen';

/**
 * Screen 3d - the make-a-plan flow's last step. There is no Plan Overview screen in this
 * slice to land on after confirming a time or starting a vote (see the make-a-plan report's
 * ambiguity section), so both of this screen's call-to-actions end the flow the same way:
 * `router.dismissTo('/')` pops the whole 3b/3c/3d stack back to Home in one step, rather than
 * `router.back()` x3 or a no-op button with nowhere to go.
 */
export default function MakeAPlanBestTimes() {
  const router = useRouter();
  return <BestTimesScreen onBack={() => router.back()} onDone={() => router.dismissTo('/')} />;
}

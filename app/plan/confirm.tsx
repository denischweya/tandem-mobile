import { useRouter } from 'expo-router';
import { ConfirmScreen } from '@/features/planLifecycle/ConfirmScreen';

/**
 * Screen 3f - reached from the make-a-plan flow's "Confirm" (screen 3d,
 * `app/make-a-plan/best-times.tsx`). "Done" ends the flow back at Home, the same
 * `dismissTo('/')` screen 3d's own two actions used to call directly before this screen (and
 * screen 3e) existed to dismiss *to*.
 */
export default function PlanConfirm() {
  const router = useRouter();
  return <ConfirmScreen onDone={() => router.dismissTo('/')} />;
}

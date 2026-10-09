import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlanDetailScreen } from '@/features/planLifecycle/PlanDetailScreen';

/**
 * Screen 3g - a plan's detail view. Reached from Home's "Your next plan" card
 * (`PlanCard`'s `onPress`, in `src/features/home/HomeScreen.tsx`), which links to
 * `/plan/${nextPlan.id}` - `plan-dinner` in the mocked fixture
 * (`src/features/planLifecycle/fixtures.ts`). Its back chevron pops back to Home with
 * `router.back()`, a true "back" (unlike 3e/3f) since this screen was reached by pushing
 * forward from Home, not by finishing a multi-step flow.
 */
export default function PlanDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlanDetailScreen planId={id ?? ''} onBack={() => router.back()} />;
}

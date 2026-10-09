import { useRouter } from 'expo-router';
import { WhatWhoScreen } from '@/features/makeAPlan/WhatWhoScreen';

/** Screen 3b - the make-a-plan flow's first step. Reached from Home's "Make a plan" button
 * (`app/index.tsx`); its close icon has nowhere "back" to go to within the flow (it's step
 * 1), so it dismisses the whole thing back to Home via `router.back()`. */
export default function MakeAPlanWhatWho() {
  const router = useRouter();
  return (
    <WhatWhoScreen onBack={() => router.back()} onNext={() => router.push('/make-a-plan/when')} />
  );
}

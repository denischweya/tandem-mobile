import { useRouter } from 'expo-router';
import { WhenScreen } from '@/features/makeAPlan/WhenScreen';

/** Screen 3c - step 2 of the make-a-plan flow. Its back chevron returns to 3b
 * (`router.back()`), preserving whatever was already chosen there since both screens read
 * and write the same `usePlanDraftStore`. */
export default function MakeAPlanWhen() {
  const router = useRouter();
  return (
    <WhenScreen
      onBack={() => router.back()}
      onNext={() => router.push('/make-a-plan/best-times')}
    />
  );
}

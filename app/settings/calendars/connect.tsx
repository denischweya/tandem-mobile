import { useRouter } from 'expo-router';
import { ConnectCalendarScreen } from '@/features/calendars/ConnectCalendarScreen';

/**
 * Screen 3h. Reached from the make-a-plan flow's "Change" affordance (screen 3c,
 * `src/features/makeAPlan/WhenScreen.tsx`, via `app/make-a-plan/when.tsx`) - previously inert
 * because there was nowhere for it to go - and from screen 3i's "Connect another calendar".
 * A successful (mocked) connection continues to the settings screen (3i), the only place its
 * permissions can be reviewed or changed; declining ("I'll enter my availability myself") or
 * closing both just return to whichever of those two screens opened this one.
 */
export default function ConnectCalendar() {
  const router = useRouter();
  return (
    <ConnectCalendarScreen
      onBack={() => router.back()}
      onConnected={() => router.push('/settings/calendars')}
    />
  );
}

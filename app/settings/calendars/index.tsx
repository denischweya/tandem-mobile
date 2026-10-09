import { useRouter } from 'expo-router';
import { CalendarSettingsScreen } from '@/features/calendars/CalendarSettingsScreen';

/**
 * Screen 3i. Reached from the make-a-plan flow's "Change" (via screen 3h,
 * `app/settings/calendars/connect.tsx`) and from this same screen's own "Connect another
 * calendar" row, which pushes back to that connect screen for one more provider.
 */
export default function CalendarSettings() {
  const router = useRouter();
  return (
    <CalendarSettingsScreen
      onBack={() => router.back()}
      onConnectAnother={() => router.push('/settings/calendars/connect')}
    />
  );
}

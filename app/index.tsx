import { StyleSheet, Text, View } from 'react-native';
import { toZonedParts } from '@tandem/shared';
import { apiBaseUrl } from '@/config/env';

export default function Index() {
  const parts = toZonedParts(new Date(), 'Africa/Nairobi');

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Tandem
      </Text>
      <Text style={styles.body}>API: {apiBaseUrl}</Text>
      <Text style={styles.body}>
        Nairobi: {parts.hour.toString().padStart(2, '0')}:
        {parts.minute.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '600' },
  body: { fontSize: 15, opacity: 0.7 },
});

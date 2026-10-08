import Constants from 'expo-constants';

function readApiBaseUrl(): string {
  // Precedence: env override, then app.json, then the localhost default. The env layer gives
  // tandem-mobile the same escape hatch tandem-web has via NEXT_PUBLIC_API_BASE_URL, instead
  // of the URL being reachable only by editing a committed app.json.
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const fromConfig = Constants.expoConfig?.extra?.['apiBaseUrl'];

  const raw =
    typeof fromEnv === 'string' && fromEnv.length > 0
      ? fromEnv
      : typeof fromConfig === 'string' && fromConfig.length > 0
        ? fromConfig
        : 'http://localhost:8000/api/v1';

  return raw.replace(/\/+$/, '');
}

export const apiBaseUrl: string = readApiBaseUrl();

// See env.test.ts for why this delete must precede a `require`, not a static `import`: the
// import would be hoisted above it by Babel and the delete would run too late to matter.
delete process.env.EXPO_PUBLIC_API_BASE_URL;

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {} } }));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- must run after the delete.
const { apiBaseUrl } = require('./env') as typeof import('./env');

it('falls back to localhost when nothing is configured', () => {
  expect(apiBaseUrl).toBe('http://localhost:8000/api/v1');
});

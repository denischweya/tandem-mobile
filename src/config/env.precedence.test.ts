// Covers the one behaviour `readApiBaseUrl` exists to implement and that neither other file
// exercises: EXPO_PUBLIC_API_BASE_URL must win when both it and app.json's `extra.apiBaseUrl`
// are set. A third file is required because `apiBaseUrl` is a module-load-time const - this
// scenario needs the env var set before './env' is first evaluated, which would collide with
// env.test.ts (mocked config, env unset) and env.fallback.test.ts (nothing set) if they shared
// a module registry. Jest gives each test file its own registry, so a separate file is the way
// to get a separate load-time evaluation of the module under test.
//
// As elsewhere, this sets process.env before a `require` of './env', not a static `import`:
// Babel hoists `import` above all other statements in the file (verified directly - a static
// import here reads the value from before this line ran, not after), so the set has to precede
// a plain `require` call instead to actually take effect before the module body runs.
process.env.EXPO_PUBLIC_API_BASE_URL = 'https://env-wins.example/api/v1/';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl: 'https://config-loses.example/api/v1' } } },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- must run after the env var set above.
const { apiBaseUrl } = require('./env') as typeof import('./env');

afterAll(() => {
  // Defensive cleanup: Jest can run multiple test files in the same worker process, and
  // process.env is a single shared global across them, unlike the module registry. Without
  // this, a later file in the same worker could silently inherit this value.
  delete process.env.EXPO_PUBLIC_API_BASE_URL;
});

it('prefers EXPO_PUBLIC_API_BASE_URL over the app.json config value when both are set', () => {
  expect(apiBaseUrl).toBe('https://env-wins.example/api/v1');
});

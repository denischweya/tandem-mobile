// Load-bearing: this file's assertions only distinguish the configured value from the
// hardcoded fallback. If EXPO_PUBLIC_API_BASE_URL is set in the ambient environment, env.ts
// would read that instead of the mocked Constants value below and every assertion here would
// still happen to pass - for the wrong reason - which is the silently-wrong-green failure this
// delete prevents. A static `import` of './env' is hoisted above this line by Babel regardless
// of source order, so the delete would otherwise run too late to affect the module's
// load-time evaluation; `require` after the delete is not hoisted, so order here is real.
delete process.env.EXPO_PUBLIC_API_BASE_URL;

// Load-bearing: without __esModule: true, babel's interop leaves `expoConfig` undefined and
// the module silently falls back to the localhost default - which is exactly how the original
// version of this test passed 3/3 while verifying nothing. Under jest-expo the real
// Constants.expoConfig is {} and `extra` is undefined, so an unmocked test can only ever
// exercise the fallback.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl: 'https://api.example/api/v1/' } } },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- must run after the delete above.
const { apiBaseUrl } = require('./env') as typeof import('./env');

describe('apiBaseUrl', () => {
  it('is an absolute http(s) URL', () => {
    expect(apiBaseUrl).toMatch(/^https?:\/\//);
  });

  it('does not end in a slash, so path joining is unambiguous', () => {
    expect(apiBaseUrl.endsWith('/')).toBe(false);
  });

  it('targets the versioned API surface', () => {
    expect(apiBaseUrl).toContain('/api/v1');
  });

  it('reads the configured value and strips its trailing slash', () => {
    // The only assertion here that a hard-coded fallback cannot satisfy. The mocked value
    // ends in a slash precisely so this exercises the strip rather than asserting a constant.
    expect(apiBaseUrl).toBe('https://api.example/api/v1');
  });
});

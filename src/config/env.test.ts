import { apiBaseUrl } from './env';

// Load-bearing: without __esModule: true, babel's interop leaves `expoConfig` undefined and
// the module silently falls back to the localhost default - which is exactly how the original
// version of this test passed 3/3 while verifying nothing. Under jest-expo the real
// Constants.expoConfig is {} and `extra` is undefined, so an unmocked test can only ever
// exercise the fallback.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl: 'https://api.example/api/v1/' } } },
}));

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

import { apiBaseUrl } from './env';

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {} } }));

it('falls back to localhost when nothing is configured', () => {
  expect(apiBaseUrl).toBe('http://localhost:8000/api/v1');
});

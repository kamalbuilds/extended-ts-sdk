import { HttpClient, buildUrl } from '../../utils/http';

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.example.com');
  });

  test('should create HttpClient instance', () => {
    expect(httpClient).toBeInstanceOf(HttpClient);
  });
});

describe('buildUrl', () => {
  test('should build URL without parameters', () => {
    const url = buildUrl('/api/users');
    expect(url).toBe('/api/users');
  });

  test('should build URL with path parameters', () => {
    const url = buildUrl('/api/users/<userId>', { userId: 123 });
    expect(url).toBe('/api/users/123');
  });

  test('should build URL with query parameters', () => {
    const url = buildUrl('/api/users', undefined, { limit: 10, active: true });
    expect(url).toBe('/api/users?limit=10&active=true');
  });

  test('should build URL with both path and query parameters', () => {
    const url = buildUrl('/api/users/<userId>/orders', { userId: 123 }, { status: 'active' });
    expect(url).toBe('/api/users/123/orders?status=active');
  });

  test('should handle optional path parameters', () => {
    const url = buildUrl('/api/users/<userId?>', { userId: '' });
    expect(url).toBe('/api/users');
  });

  test('should handle array query parameters', () => {
    const url = buildUrl('/api/users', undefined, { tags: ['tag1', 'tag2'] });
    expect(url).toBe('/api/users?tags=tag1&tags=tag2');
  });
});
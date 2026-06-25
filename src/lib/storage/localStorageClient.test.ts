import { describe, it, expect, beforeEach } from 'vitest';
import { createStorageClient } from './localStorageClient';

describe('localStorageClient', () => {
  let client = createStorageClient();

  beforeEach(() => {
    window.localStorage.clear();
    client = createStorageClient();
  });

  it('reports available in jsdom', () => {
    expect(client.isAvailable()).toBe(true);
  });

  it('round-trips JSON values', () => {
    client.set('k', { a: 1, b: ['x'] });
    expect(client.get('k', null)).toEqual({ a: 1, b: ['x'] });
  });

  it('returns fallback for missing key', () => {
    expect(client.get('nope', 42)).toBe(42);
  });

  it('returns fallback for corrupted JSON', () => {
    window.localStorage.setItem('bad', '{not json');
    expect(client.get('bad', 'fallback')).toBe('fallback');
  });

  it('remove and has work', () => {
    client.set('k', 1);
    expect(client.has('k')).toBe(true);
    client.remove('k');
    expect(client.has('k')).toBe(false);
  });

  it('keys lists stored keys', () => {
    client.set('a', 1);
    client.set('b', 2);
    expect(client.keys().sort()).toEqual(['a', 'b']);
  });
});

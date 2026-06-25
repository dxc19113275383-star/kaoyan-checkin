import { describe, it, expect, beforeEach } from 'vitest';
import { getResources, setResources, addResource, removeResource } from './resourcesStore';

describe('resourcesStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setResources({ resources: [], studySessions: [] });
  });

  it('adds a resource at the front with id + createdAt', () => {
    const a = addResource({ title: '英语二网课', type: '网课', url: 'https://x' });
    expect(a.id).toBeTruthy();
    expect(a.createdAt).toBeTruthy();
    const list = getResources().resources;
    expect(list[0].title).toBe('英语二网课');
  });

  it('newest added is first', () => {
    addResource({ title: 'A' });
    addResource({ title: 'B' });
    expect(getResources().resources.map((r) => r.title)).toEqual(['B', 'A']);
  });

  it('removes by id', () => {
    const a = addResource({ title: 'A' });
    addResource({ title: 'B' });
    removeResource(a.id);
    expect(getResources().resources.map((r) => r.title)).toEqual(['B']);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMistakes,
  setMistakes,
  recordMistake,
  resolveMistake,
  listOpenMistakes,
  mistakeKey,
} from './mistakesStore';

describe('mistakesStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setMistakes({}); // 初始化空错题集（同时建立 AppState 信封）
  });

  it('records a new mistake with count 1', () => {
    recordMistake('math', 'q1', { title: '极限', tag: '高数' });
    const m = getMistakes()[mistakeKey('math', 'q1')];
    expect(m.count).toBe(1);
    expect(m.title).toBe('极限');
    expect(m.resolved).toBe(false);
  });

  it('accumulates count on repeat and reopens resolved', () => {
    recordMistake('math', 'q1');
    resolveMistake('math', 'q1');
    expect(getMistakes()[mistakeKey('math', 'q1')].resolved).toBe(true);
    recordMistake('math', 'q1'); // 再次做错 → 重新打开 + 计数
    const m = getMistakes()[mistakeKey('math', 'q1')];
    expect(m.count).toBe(2);
    expect(m.resolved).toBe(false);
  });

  it('listOpenMistakes filters resolved and by module', () => {
    recordMistake('math', 'q1', { tag: '高数' });
    recordMistake('vocab', 'w1', { tag: '词汇' });
    recordMistake('math', 'q2');
    resolveMistake('math', 'q2');

    expect(listOpenMistakes().length).toBe(2); // q1 + w1（q2 已解决）
    expect(listOpenMistakes('math').length).toBe(1); // 仅 q1
    expect(listOpenMistakes('vocab').map((x) => x.refId)).toEqual(['w1']);
  });

  it('resolveMistake sets resolvedAt timestamp', () => {
    recordMistake('reading', 'a1');
    resolveMistake('reading', 'a1');
    expect(getMistakes()[mistakeKey('reading', 'a1')].resolvedAt).toBeTruthy();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { getMessages, appendMessage, clearMessages, setAi } from './aiStore';

describe('aiStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setAi({ chats: [] });
  });

  it('appends messages into a single history, creating it on first append', () => {
    expect(getMessages()).toEqual([]);
    appendMessage({ role: 'user', content: 'hi' });
    appendMessage({ role: 'assistant', content: 'yo' });
    const msgs = getMessages();
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(msgs[1].content).toBe('yo');
  });

  it('clearMessages empties history', () => {
    appendMessage({ role: 'user', content: 'x' });
    clearMessages();
    expect(getMessages()).toEqual([]);
  });
});

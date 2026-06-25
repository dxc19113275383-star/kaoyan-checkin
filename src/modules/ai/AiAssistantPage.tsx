import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { AI_MODES } from './aiPrompts';
import type { AiMode } from './aiTypes';
import { ask } from './aiClient';
import { getMessages, appendMessage, clearMessages } from './aiStore';

export function AiAssistantPage() {
  const [mode, setMode] = useState<AiMode>('qa');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);

  const messages = getMessages();

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    appendMessage({ role: 'user', content: q, ts: new Date().toISOString() });
    setInput('');
    setBusy(true);
    refresh();
    const res = await ask(mode, q);
    const content = res.reply ?? (res.error ? `[出错] ${res.error}` : '（无内容）');
    appendMessage({ role: 'assistant', content, ts: new Date().toISOString() });
    setBusy(false);
    refresh();
  };

  const onClear = () => {
    if (window.confirm('清空对话历史？')) {
      clearMessages();
      refresh();
    }
  };

  return (
    <ModuleScaffold
      title="AI 助手"
      legacyHash="#ai"
      responsibilities={[
        '调用 Netlify chat 函数（DeepSeek 代理，密钥仅服务端）',
        '模式：答疑 / 错题讲解 / 计划重排（提示词在 aiPrompts.ts）',
      ]}
    >
      <Tabs
        items={Object.values(AI_MODES).map((m) => ({ id: m.id, label: m.label }))}
        active={mode}
        onChange={(id) => setMode(id as AiMode)}
      />

      <Card title="对话">
        {messages.length === 0 ? (
          <p className="ky-data-hint">还没有对话。试着问：「英语二阅读怎么入门」。</p>
        ) : (
          <div className="ky-chat">
            {messages.map((m, i) => (
              <div key={i} className={`ky-msg ky-msg--${m.role}`}>
                <span className="ky-msg__role">{m.role === 'user' ? '我' : 'AI'}</span>
                <div className="ky-msg__body">{m.content}</div>
              </div>
            ))}
            {busy && <div className="ky-msg ky-msg--assistant"><span className="ky-msg__role">AI</span><div className="ky-msg__body">思考中…</div></div>}
          </div>
        )}
        <div className="ky-chat__input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${AI_MODES[mode].label}模式 · 输入问题`}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
            }}
          />
          <div className="ky-chat__btns">
            <Button onClick={send} disabled={busy || !input.trim()}>发送 (⌘/Ctrl+Enter)</Button>
            {messages.length > 0 && <Button variant="ghost" onClick={onClear}>清空</Button>}
          </div>
        </div>
        <p className="ky-data-hint">需后端可用（已部署到 Netlify 时 /api/chat 生效；纯本地 vite dev 下会返回出错）。</p>
      </Card>
    </ModuleScaffold>
  );
}

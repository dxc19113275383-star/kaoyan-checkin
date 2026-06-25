/**
 * aiClient —— 调用 Netlify chat 函数（DeepSeek 代理）。
 *
 * 安全：API Key 只在服务端（chat.js）通过环境变量读取，前端永远不接触密钥。
 * 端点：相对路径 `/api/chat`（netlify.toml 重定向到 /.netlify/functions/chat）。
 */
import type { AiMode, ChatRequest, ChatResponse } from './aiTypes';
import { getModeDef } from './aiPrompts';

/** 默认端点，走 netlify.toml 的 /api/chat 重定向。可在调用处覆盖（如指向固定生产域名）。 */
export const DEFAULT_CHAT_ENDPOINT = '/api/chat';

export interface AskOptions {
  endpoint?: string;
  context?: string;
  formatHint?: string;
  signal?: AbortSignal;
}

/**
 * 向 AI 提问。返回后端响应（成功含 answer，失败含 error）。
 * 网络/解析异常被捕获并转为 { error }，调用方无需 try/catch。
 */
export async function ask(mode: AiMode | string, question: string, opts: AskOptions = {}): Promise<ChatResponse> {
  const def = getModeDef(mode);
  const body: ChatRequest = {
    mode: def.apiMode,
    question,
    context: opts.context ?? def.systemPrompt,
    formatHint: opts.formatHint,
  };
  try {
    const resp = await fetch(opts.endpoint ?? DEFAULT_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: opts.signal,
    });
    const data = (await resp.json()) as ChatResponse;
    if (!resp.ok) return { error: data?.error ?? `HTTP ${resp.status}` };
    return data;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'network-error' };
  }
}

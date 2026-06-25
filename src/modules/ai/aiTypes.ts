/**
 * ai 模块类型 —— AI 助手对话 / 模式。
 * 对应现役 `state.aiChats`。AI 内容库（提示词）见 aiPrompts.ts。
 */

/** AI 模式：答疑 / 错题讲解 / 计划重排（后续学习调度引擎在此扩展）。 */
export type AiMode = 'qa' | 'mistake' | 'replan';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts?: string;
}

export interface AiChat {
  id: string;
  mode: AiMode | string;
  messages: AiMessage[];
  createdAt: string;
}

export interface AiState {
  chats: AiChat[];
}

export const defaultAiState = (): AiState => ({
  chats: [],
});

/** 发往 Netlify chat 函数的请求体（与现役 chat.js 约定一致：mode/question/context）。 */
export interface ChatRequest {
  mode: AiMode | string;
  question: string;
  context?: string;
  formatHint?: string;
}

export interface ChatResponse {
  /** 成功回复（chat.js 返回 { reply }）。 */
  reply?: string;
  error?: string;
  [k: string]: unknown;
}

/**
 * aiStore —— AI 对话历史读写（单条贯通历史，存于 ai.chats[0]）。统一走 kaoyan_v2。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { AiState, AiMessage, AiChat } from './aiTypes';

export const getAi = (): AiState => readSlice('ai');
export const setAi = (next: AiState): void => writeSlice('ai', next);

/** 取当前历史消息（不存在返回空数组）。 */
export function getMessages(): AiMessage[] {
  return getAi().chats[0]?.messages ?? [];
}

/** 追加一条消息到历史（无历史则创建）。 */
export function appendMessage(msg: AiMessage): void {
  const ai = getAi();
  let chat: AiChat | undefined = ai.chats[0];
  if (!chat) {
    chat = { id: `chat_${Date.now()}`, mode: 'qa', messages: [], createdAt: new Date().toISOString() };
    ai.chats = [chat];
  }
  chat.messages.push(msg);
  setAi(ai);
}

/** 清空历史。 */
export function clearMessages(): void {
  setAi({ chats: [] });
}

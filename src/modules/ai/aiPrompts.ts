/**
 * aiPrompts —— AI 提示词与模式定义，从页面代码中抽离（验收：接口和提示词不写死在页面里）。
 *
 * V7.0 不把 AI 扩展成完整 Agent，但把「模式 → 系统提示」集中在此，
 * 便于 V7.3 学习调度引擎复用与迭代。
 */
import type { AiMode } from './aiTypes';

export interface AiModeDef {
  id: AiMode;
  label: string;
  /** 传给后端的 mode 字段（与现役 chat.js 约定一致）。 */
  apiMode: string;
  /** 该模式的系统/上下文提示。 */
  systemPrompt: string;
}

export const AI_MODES: Record<AiMode, AiModeDef> = {
  qa: {
    id: 'qa',
    label: '答疑',
    apiMode: 'qa',
    systemPrompt:
      '你是考研英语二 / 管理类联考的答疑老师。用简体中文，先给结论再给理由，必要时给例子。回答精炼、可执行。',
  },
  mistake: {
    id: 'mistake',
    label: '错题讲解',
    apiMode: 'qa',
    systemPrompt:
      '你是错题讲解老师。针对给定错题，指出错因类型（粗心/知识点/审题/遗忘），讲清正确思路，并给一道同类练习。',
  },
  replan: {
    id: 'replan',
    label: '计划重排',
    apiMode: 'qa',
    systemPrompt:
      '你是备考规划助手。根据当前进度与薄弱点，给出未来几天的今日任务重排建议，量化到「单词数/阅读篇数/题量」。',
  },
};

export function getModeDef(mode: AiMode | string): AiModeDef {
  return (AI_MODES as Record<string, AiModeDef>)[mode] ?? AI_MODES.qa;
}

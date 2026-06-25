import type { ComponentType } from 'react';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { CheckinPage } from '@/modules/checkin/CheckinPage';
import { VocabPage } from '@/modules/learn/vocab/VocabPage';
import { MathPage } from '@/modules/learn/math/MathPage';
import { ReadingPage } from '@/modules/learn/reading/ReadingPage';
import { SyntaxPage } from '@/modules/learn/syntax/SyntaxPage';
import { MistakesPage } from '@/modules/learn/mistakes/MistakesPage';
import { ResourcesPage } from '@/modules/resources/ResourcesPage';
import { AiAssistantPage } from '@/modules/ai/AiAssistantPage';
import { PushPage } from '@/modules/push/PushPage';
import { DataPage } from '@/modules/settings/DataPage';

export interface RouteDef {
  id: string;
  label: string;
  component: ComponentType;
}

/**
 * 路由注册表（V7.0 用轻量 hash 切换，不引入 react-router 以保持依赖精简）。
 * 顺序即导航顺序。
 */
export const routes: RouteDef[] = [
  { id: 'dashboard', label: '仪表盘', component: DashboardPage },
  { id: 'checkin', label: '打卡', component: CheckinPage },
  { id: 'vocab', label: '词汇', component: VocabPage },
  { id: 'reading', label: '阅读', component: ReadingPage },
  { id: 'math', label: '数学', component: MathPage },
  { id: 'syntax', label: '长难句', component: SyntaxPage },
  { id: 'mistakes', label: '错题', component: MistakesPage },
  { id: 'resources', label: '资料', component: ResourcesPage },
  { id: 'ai', label: 'AI 助手', component: AiAssistantPage },
  { id: 'push', label: '推送', component: PushPage },
  { id: 'data', label: '数据备份', component: DataPage },
];

export const DEFAULT_ROUTE = 'dashboard';

import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { AI_MODES } from './aiPrompts';

export function AiAssistantPage() {
  return (
    <ModuleScaffold
      title="AI 助手"
      legacyHash="#ai"
      responsibilities={[
        '调用 netlify/functions/chat.js（DeepSeek 代理）',
        '模式切换：答疑 / 错题讲解 / 计划重排',
        '提示词与接口已从页面代码抽出（aiPrompts.ts / aiClient.ts）',
        '学习调度引擎留待 V7.3',
      ]}
    >
      <Card title="可用模式">
        <ul className="ky-list">
          {Object.values(AI_MODES).map((m) => (
            <li key={m.id}>
              <strong>{m.label}</strong>：{m.systemPrompt}
            </li>
          ))}
        </ul>
      </Card>
    </ModuleScaffold>
  );
}

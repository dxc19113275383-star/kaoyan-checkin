import { ModuleScaffold } from '@/app/ModuleScaffold';
import { TodayTasks } from './TodayTasks';
import { Heatmap } from './Heatmap';
import { WeaknessPanel } from './WeaknessPanel';

export function DashboardPage() {
  return (
    <ModuleScaffold
      title="仪表盘"
      legacyHash="#home"
      responsibilities={[
        '首页学习仪表盘 / 今日任务 / 学习进度',
        '热力图 / 偏科预警 / 薄弱点展示 / 学习概览',
      ]}
    >
      <TodayTasks />
      <Heatmap />
      <WeaknessPanel />
    </ModuleScaffold>
  );
}

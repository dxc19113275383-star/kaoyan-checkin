import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCheckin, setCheckin, updateCheckin } from './checkinStore';
import { computeTotalDays, weekDoneDays, isTodayDone, markTodayDone } from './checkinLogic';
import { daysUntil } from '@/lib/utils/date';

/**
 * 打卡（V7.1：迁成可运行 React 页面）。
 * 操作统一数据源 `kaoyan_v2`：今日打卡 / 阶段切换 / 考试日期 —— 现役 index.html 同步可见。
 * 完整每日任务清单（按周计划模板）仍由现役训练舱渲染。
 */
export function CheckinPage() {
  const [, setTick] = useState(0);
  const c = getCheckin();
  const refresh = () => setTick((t) => t + 1);

  const toggleToday = () => {
    setCheckin(markTodayDone(c, !isTodayDone(c)));
    refresh();
  };

  const toggleStage = () => {
    const next = c.p === 1 ? 0 : 1;
    const label = next === 1 ? '全职' : '在职';
    if (window.confirm(`切换到「${label}」阶段？这会改变现役应用的每日任务计划视图。`)) {
      updateCheckin({ p: next });
      refresh();
    }
  };

  const onExamDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      updateCheckin({ examDate: e.target.value });
      refresh();
    }
  };

  const left = daysUntil(c.examDate);
  const doneToday = isTodayDone(c);

  return (
    <ModuleScaffold
      title="打卡"
      legacyHash="#checkin"
      responsibilities={[
        '每日打卡 / 在职·全职阶段切换 / 学习状态',
        '打卡记录的本地读写与迁移（统一走 kaoyan_v2）',
        '不负责：AI 聊天 / 词库 / 数学题库 / 推送发送',
      ]}
    >
      <Card title="今日打卡">
        <p className="ky-checkin__big">{doneToday ? '✅ 今天已打卡' : '⬜ 今天还没打卡'}</p>
        <Button variant={doneToday ? 'ghost' : 'primary'} onClick={toggleToday}>
          {doneToday ? '取消今日打卡' : '完成今日打卡（保底）'}
        </Button>
        <p className="ky-data-hint">完整任务清单与勾选仍在现役训练舱；这里是快速保底打卡。</p>
      </Card>

      <Card title="阶段 · 倒计时">
        <ul className="ky-list">
          <li>
            当前阶段：<strong>{c.p === 1 ? '全职' : '在职'}</strong>{' '}
            <button className="ky-link" onClick={toggleStage}>切换</button>
          </li>
          <li>进度：第 {c.wk} 周 第 {c.day + 1} 天</li>
          <li>
            考试日期：
            <input type="date" defaultValue={c.examDate} onChange={onExamDate} className="ky-date" />
            {left >= 0 ? `（还有 ${left} 天）` : `（已过 ${-left} 天）`}
          </li>
        </ul>
      </Card>

      <Card title="统计">
        <ul className="ky-list">
          <li>累计打卡天数：{computeTotalDays(c)}</li>
          <li>本周已打卡：{weekDoneDays(c)} 天</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}

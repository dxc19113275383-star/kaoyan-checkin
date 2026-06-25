/**
 * dashboard 模块类型 —— 首页学习仪表盘 / 今日任务 / 热力图 / 偏科预警 / 薄弱点笔记。
 *
 * dashboard 多为「派生视图」：今日任务来自 checkin，偏科/薄弱来自 learn 脊柱。
 * 仅 notes（薄弱点笔记）是 dashboard 自有的持久化数据，对应现役 `state.notes`。
 */

/** 薄弱点笔记：键 = 日期 YYYY-MM-DD。 */
export interface WeaknessNote {
  weakSubject: string;
  text: string;
  ts?: string;
}

export interface DashboardState {
  /** 薄弱点笔记历史。 */
  notes: Record<string, WeaknessNote>;
}

export const defaultDashboardState = (): DashboardState => ({
  notes: {},
});

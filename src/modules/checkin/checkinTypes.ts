/**
 * checkin 模块类型 —— 每日打卡 / 在职·全职阶段 / 每日任务 / 打卡记录。
 *
 * 这些字段对应现役 `kaoyan_v2` 主状态的顶层切片（见 index.html 默认 state）。
 * 内容不变，只是补上 TypeScript 类型，作为 V7.1 迁移到 React 的契约。
 */

/** 备考阶段：0 = 在职，1 = 全职（与现役 `state.p` 数值一致）。 */
export type StageIndex = 0 | 1;

/** 单日完成情况：键 = `p{p}w{wk}d{day}`，值 = 已完成任务下标数组。 */
export type CheckinDataMap = Record<string, number[]>;

export interface CheckinState {
  /** 当前阶段 0 在职 / 1 全职。 */
  p: StageIndex;
  /** 当前周（从 1 起）。 */
  wk: number;
  /** 当前天下标（0-6）。 */
  day: number;
  /** 打卡完成记录。 */
  data: CheckinDataMap;
  /** 备考开始日期 YYYY-MM-DD，null 表示尚未设定。 */
  startDate: string | null;
  /** 考试日期 YYYY-MM-DD。 */
  examDate: string;
  /** 自定义任务：键 = `p{p}w{wk}d{day}`，值 = 任务文本数组。 */
  customTasks: Record<string, string[]>;
  /** 被用户删除的默认任务下标：键同上。 */
  deletedDefaults: Record<string, number[]>;
}

export const defaultCheckinState = (): CheckinState => ({
  p: 0,
  wk: 1,
  day: 0,
  data: {},
  startDate: null,
  examDate: '2027-12-25',
  customTasks: {},
  deletedDefaults: {},
});

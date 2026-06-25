/**
 * push 模块类型 —— Web Push 订阅 / 应用内学习提醒设置。
 * 对应现役 `state.notificationSettings`（Web Push）与 `state.reminderSettings`（应用内提醒）。
 */

/** 通知语气。 */
export type ReminderTone = 'normal' | 'gentle' | 'strict';

/** Web Push 设置（对应 notificationSettings）。 */
export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission | 'default';
  subscriptionSaved: boolean;
  reminderTime: string;
  tone: ReminderTone | string;
}

/** 应用内提醒设置（对应 reminderSettings）。 */
export interface ReminderSettings {
  enabled: boolean;
  tone: ReminderTone | string;
  quietHours: { start: string; end: string };
  systemNotificationEnabled: boolean;
}

export interface PushState {
  notificationSettings: NotificationSettings;
  reminderSettings: ReminderSettings;
  /** 提醒日志：键 = 日期。 */
  reminderLog: Record<string, unknown>;
}

export const defaultPushState = (): PushState => ({
  notificationSettings: {
    enabled: false,
    permission: 'default',
    subscriptionSaved: false,
    reminderTime: '20:30',
    tone: 'normal',
  },
  reminderSettings: {
    enabled: true,
    tone: 'normal',
    quietHours: { start: '23:30', end: '08:00' },
    systemNotificationEnabled: false,
  },
  reminderLog: {},
});

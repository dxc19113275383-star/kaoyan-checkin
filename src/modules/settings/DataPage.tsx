import { useRef, useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { downloadExport, importFromFile, exportAll } from '@/lib/storage/dataTransfer';

/**
 * 数据备份页 —— 全量导出/导入（V7.1 云同步前的本地安全网，跨设备手动搬数据）。
 * 操作的是统一数据源 `kaoyan_v2` + 用户自建内容；导入前自动备份。
 */
export function DataPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>('');

  const onExport = () => {
    const bundle = exportAll();
    const auxCount = Object.keys(bundle.aux).length;
    downloadExport(bundle);
    setMsg(`已导出：主状态 + ${auxCount} 个用户库。`);
  };

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const r = await importFromFile(file);
      setMsg(`导入成功：主状态${r.legacyWritten ? '✓' : '（空）'}，用户库 ${r.auxKeys} 个。已备份原数据，刷新页面后生效。`);
    } catch (err) {
      setMsg(`导入失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <ModuleScaffold
      title="数据备份"
      legacyHash="#settings"
      responsibilities={[
        '全量导出 / 导入（kaoyan_v2 + 用户自建词库/文章/题集）',
        '导入前自动备份；V7.1 云同步前的跨设备安全网',
      ]}
    >
      <Card title="导出 / 导入">
        <div className="ky-data-actions">
          <Button variant="primary" onClick={onExport}>导出备份 (.json)</Button>
          <Button variant="ghost" onClick={onPick}>从文件导入</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={onFile}
          />
        </div>
        {msg && <p className="ky-data-msg">{msg}</p>}
        <p className="ky-data-hint">
          提示：导入会覆盖当前数据（已自动备份为 <code>ky_backup_*</code>）。导入后请刷新页面。
        </p>
      </Card>
    </ModuleScaffold>
  );
}

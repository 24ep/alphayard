import React from 'react'
import { DownloadIcon, RefreshCwIcon, Loader2Icon, ActivityIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AuditLogProps {
  activityLoading: boolean
  activityFilter: 'all' | 'config' | 'user' | 'webhook' | 'security'
  setActivityFilter: (filter: 'all' | 'config' | 'user' | 'webhook' | 'security') => void
  filteredActivityLog: any[]
  activityLog: any[]
  onExportActivity: () => void
  onRefreshActivity: () => void
}

export const AuditLog: React.FC<AuditLogProps> = ({
  activityLoading,
  activityFilter,
  setActivityFilter,
  filteredActivityLog,
  activityLog,
  onExportActivity,
  onRefreshActivity,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Activity Log</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Audit trail of all configuration changes and admin actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExportActivity} title="Export activity log as CSV">
            <DownloadIcon className="w-4 h-4 mr-1.5" /> Export
          </Button>
          <Button variant="outline" onClick={onRefreshActivity} disabled={activityLoading} title="Refresh activity log">
            {activityLoading ? <Loader2Icon className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCwIcon className="w-4 h-4 mr-1.5" />} Refresh
          </Button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-1.5 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800/50">
        {(['all', 'config', 'user', 'webhook', 'security'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActivityFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activityFilter === t ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-zinc-400'}`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)} {t !== 'all' && <span className="ml-1 text-[10px] opacity-60">({activityLog.filter(l => l.type === t).length})</span>}
          </button>
        ))}
      </div>

      {activityLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : filteredActivityLog.length === 0 ? (
        <div className="text-center py-10">
          <ActivityIcon className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">{activityFilter === 'all' ? 'No activity recorded yet' : `No ${activityFilter} events found`}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredActivityLog.map((log, i) => {
            const typeColors: Record<string, string> = {
              config: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
              user: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
              webhook: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
              security: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400',
            }
            return (
              <div key={log.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-zinc-800/20' : ''}`}>
                <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${typeColors[log.type] || 'bg-gray-100 text-gray-500'}`}>
                  {log.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">{log.action}</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    by <span className="font-medium">{log.user}</span> · {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/50 flex items-center justify-between">
        <p className="text-[10px] text-gray-400">{filteredActivityLog.length} of {activityLog.length} entries</p>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { 
  UsersIcon, 
  SearchIcon, 
  FilterIcon, 
  PlusIcon,
  RefreshCwIcon,
  CreditCardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HashIcon,
  GripVerticalIcon,
  Trash2Icon,
  ShieldCheckIcon,
  MailIcon,
  MoreVerticalIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppCircle } from '../page' // We'll need to export this interface from page.tsx or move it to a shared types file

interface CircleManagementProps {
  circles: AppCircle[];
  circlesLoading: boolean;
  circleMsg: string;
  draggingCircleId: string | null;
  onDragStart: (id: string | null) => void;
  onReparent: (id: string, parentId: string | null) => void;
  onOpenCreateDrawer: () => void;
  circleBillingMode: 'perCircleLevel' | 'perAccount' | undefined;
  onSaveBillingMode: (mode: 'perCircleLevel' | 'perAccount') => void;
  billingModeSaving: boolean;
  onRefresh?: () => void;
  onOpenDetail?: (id: string) => void;
  setActiveDevGuide?: (guide: string) => void;
}

export const CircleManagement: React.FC<CircleManagementProps> = ({
  circles,
  circlesLoading,
  circleMsg,
  draggingCircleId,
  onDragStart,
  onReparent,
  onOpenCreateDrawer,
  circleBillingMode,
  onSaveBillingMode,
  billingModeSaving,
  onRefresh,
  onOpenDetail,
  setActiveDevGuide
}) => {
  const [expandedCircleIds, setExpandedCircleIds] = React.useState<string[]>([])

  const onToggleExpand = (id: string) => {
    setExpandedCircleIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Compute hierarchy
  const rootCircles = React.useMemo(() => circles.filter(c => !c.parentId), [circles])
  const circleChildrenMap = React.useMemo(() => {
    const map = new Map<string, AppCircle[]>()
    circles.forEach(c => {
      if (c.parentId) {
        const children = map.get(c.parentId) || []
        map.set(c.parentId, [...children, c])
      }
    })
    return map
  }, [circles])
  // Helper to render circle hierarchy
  const renderCircleNode = (circle: AppCircle, depth: number = 0) => {
    const isExpanded = expandedCircleIds.includes(circle.id)
    const children = circleChildrenMap.get(circle.id) || []
    const hasChildren = children.length > 0

    return (
      <div key={circle.id} className="space-y-1">
        <div
          draggable
          onDragStart={() => onDragStart(circle.id)}
          onDragOver={(e) => {
            e.preventDefault()
            // Optional: highlight drop target
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (draggingCircleId && draggingCircleId !== circle.id) {
              onReparent(draggingCircleId, circle.id)
            }
          }}
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 group border transition-all ${
            draggingCircleId === circle.id ? 'opacity-50 border-blue-400 border-dashed' : 'border-transparent'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <GripVerticalIcon className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={() => onToggleExpand(circle.id)}
            className={`p-0.5 rounded transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          >
            {hasChildren && <ChevronDownIcon className="w-4 h-4 text-gray-500" />}
          </button>
          
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
            circle.circleType === 'org' ? 'bg-amber-100 text-amber-700' : 
            circle.circleType === 'department' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {circle.name.substring(0, 1).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0" onClick={() => onOpenDetail?.(circle.id)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate cursor-pointer hover:underline">
                {circle.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 uppercase font-semibold">
                {circle.circleType}
              </span>
            </div>
            {circle.description && (
              <p className="text-xs text-gray-500 truncate">{circle.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {circle.members?.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 flex items-center justify-center text-[10px] font-medium" title={m.user?.email}>
                    {m.user?.firstName?.[0] || 'U'}
                  </div>
                ))}
                {(circle.members?.length || 0) > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500">
                    +{(circle.members?.length || 0) - 3}
                  </div>
                )}
             </div>
             <button onClick={() => onOpenDetail?.(circle.id)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVerticalIcon className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        {isExpanded && children.map(child => renderCircleNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Circle Structure</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Manage organizational units, departments, and teams.</p>
        </div>
        <div className="flex items-center gap-2">
          {circleMsg && <span className="text-xs text-blue-600 font-medium">{circleMsg}</span>}
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={circlesLoading} className="flex items-center gap-2">
            <RefreshCwIcon className={`w-4 h-4 ${circlesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={onOpenCreateDrawer} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Circle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
           {/* Hierarchy View */}
           <Card className="border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
                <div className="relative flex-1 max-w-sm">
                   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input type="text" placeholder="Filter circles..." className="w-full pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="text-xs text-gray-500 font-medium">
                   {circles.length} Total Circles
                </div>
             </div>
             <CardContent className="p-4">
                <div 
                  className="min-h-[300px] relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggingCircleId) {
                      onReparent(draggingCircleId, null)
                    }
                  }}
                >
                  {rootCircles.length > 0 ? (
                    <div className="space-y-1">
                      {rootCircles.map(c => renderCircleNode(c))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                       <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <UsersIcon className="w-6 h-6 text-gray-400" />
                       </div>
                       <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">No circles yet</h4>
                       <p className="text-xs text-gray-500 mt-1">Start by creating your first organizational unit.</p>
                       <Button size="sm" variant="outline" className="mt-4" onClick={onOpenCreateDrawer}>Create First Circle</Button>
                    </div>
                  )}
                </div>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-4">
           {/* Quick Stats/Actions */}
           <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                 <ShieldCheckIcon className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Access Control</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-3">
                Circles allow you to isolate data and users per client, team, or department within this application.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                onClick={() => setActiveDevGuide?.('circles')}
              >
                View Circles Guide
              </Button>
           </div>

           <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-4">
                 <CreditCardIcon className="w-4 h-4 text-emerald-500" />
                 <span className="text-sm font-semibold">Billing Policy</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Mode</label>
                   <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => onSaveBillingMode('perAccount')}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          circleBillingMode === 'perAccount' 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-1 ring-blue-500' 
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                        }`}
                      >
                         <div className="font-semibold text-xs mb-0.5">Per Account</div>
                         <p className="text-[10px] text-gray-500 line-clamp-2">Billing is managed at the application level for all users.</p>
                      </button>
                      <button 
                        onClick={() => onSaveBillingMode('perCircleLevel')}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          circleBillingMode === 'perCircleLevel' 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-1 ring-blue-500' 
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                        }`}
                      >
                         <div className="font-semibold text-xs mb-0.5">Per Circle Level</div>
                         <p className="text-[10px] text-gray-500 line-clamp-2">Each organizational circle can have its own billing assignee and plans.</p>
                      </button>
                   </div>
                   {billingModeSaving && (
                     <div className="flex items-center gap-2 mt-1 text-[10px] text-blue-500">
                        <RefreshCwIcon className="w-3 h-3 animate-spin" />
                        Saving changes...
                     </div>
                   )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                   <div className="flex items-center gap-2 mb-2">
                      <HashIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hierarchy Tips</span>
                   </div>
                   <ul className="space-y-2">
                      <li className="text-[10px] text-gray-500 flex items-start gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-400 mt-1 shrink-0" />
                         Drag and drop circles to reorganize the hierarchy.
                      </li>
                      <li className="text-[10px] text-gray-500 flex items-start gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-400 mt-1 shrink-0" />
                         Permissions can be inherited from parent circles down to children.
                      </li>
                   </ul>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

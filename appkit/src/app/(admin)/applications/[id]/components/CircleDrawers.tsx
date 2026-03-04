import React from 'react'
import { XIcon, Loader2Icon, GripVerticalIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppCircle, ApplicationUser } from '../page'

interface CircleDrawersProps {
  appId: string
  circles: AppCircle[]
  users: ApplicationUser[]
  // Create Circle Drawer
  createCircleDrawerOpen: boolean
  setCreateCircleDrawerOpen: (open: boolean) => void
  newCircleName: string
  setNewCircleName: (name: string) => void
  newCircleType: string
  setNewCircleType: (type: string) => void
  newCircleParentId: string
  setNewCircleParentId: (id: string) => void
  newCircleDescription: string
  setNewCircleDescription: (desc: string) => void
  newCirclePinCode: string
  setNewCirclePinCode: (pin: string) => void
  newCircleCode: string
  setNewCircleCode: (code: string) => void
  onCreateCircle: () => Promise<void>
  
  // Circle Detail Drawer
  circleDrawerOpen: boolean
  setCircleDrawerOpen: (open: boolean) => void
  selectedCircle: AppCircle | null
  circleDrawerLoading: boolean
  circleDetailTab: 'info' | 'members' | 'billing'
  setCircleDetailTab: (tab: 'info' | 'members' | 'billing') => void
  circleDetailDraft: {
    name: string
    description: string
    circleType: string
    parentId: string
    pinCode: string
    circleCode: string
  }
  setCircleDetailDraft: React.Dispatch<React.SetStateAction<{
    name: string
    description: string
    circleType: string
    parentId: string
    pinCode: string
    circleCode: string
  }>>
  circleUserSearch: string
  setCircleUserSearch: (search: string) => void
  circleUserOptions: ApplicationUser[]
  circleSelectedUserId: string
  setCircleSelectedUserId: (id: string) => void
  circleSelectedRole: 'member' | 'owner'
  setCircleSelectedRole: (role: 'member' | 'owner') => void
  onAssignCircleUser: (circleId: string) => Promise<void>
  onSwitchCircleUserRole: (userId: string, fromRole: 'member' | 'owner', toRole: 'member' | 'owner') => Promise<void>
  onRemoveCircleMember: (userId: string) => Promise<void>
  onRemoveCircleOwner: (userId: string) => Promise<void>
  
  // Billing
  circleBillingUserSearch: string
  setCircleBillingUserSearch: (search: string) => void
  circleBillingUserOptions: ApplicationUser[]
  circleSelectedBillingUserId: string
  setCircleSelectedBillingUserId: (id: string) => void
  onAssignCircleBilling: (circleId: string) => Promise<void>
  onRemoveCircleBillingAssignee: (userId: string) => Promise<void>
  circleBillingMode: 'perCircleLevel' | 'perAccount'
  
  // Main Actions
  onDeleteCircle: (circleId: string) => Promise<void>
  onSaveCircleDetail: () => Promise<void>
}

export const CircleDrawers: React.FC<CircleDrawersProps> = ({
  appId,
  circles,
  users,
  createCircleDrawerOpen,
  setCreateCircleDrawerOpen,
  newCircleName,
  setNewCircleName,
  newCircleType,
  setNewCircleType,
  newCircleParentId,
  setNewCircleParentId,
  newCircleDescription,
  setNewCircleDescription,
  newCirclePinCode,
  setNewCirclePinCode,
  newCircleCode,
  setNewCircleCode,
  onCreateCircle,
  circleDrawerOpen,
  setCircleDrawerOpen,
  selectedCircle,
  circleDrawerLoading,
  circleDetailTab,
  setCircleDetailTab,
  circleDetailDraft,
  setCircleDetailDraft,
  circleUserSearch,
  setCircleUserSearch,
  circleUserOptions,
  circleSelectedUserId,
  setCircleSelectedUserId,
  circleSelectedRole,
  setCircleSelectedRole,
  onAssignCircleUser,
  onSwitchCircleUserRole,
  onRemoveCircleMember,
  onRemoveCircleOwner,
  circleBillingUserSearch,
  setCircleBillingUserSearch,
  circleBillingUserOptions,
  circleSelectedBillingUserId,
  setCircleSelectedBillingUserId,
  onAssignCircleBilling,
  onRemoveCircleBillingAssignee,
  circleBillingMode,
  onDeleteCircle,
  onSaveCircleDetail,
}) => {
  return (
    <>
      {/* Create Circle Drawer */}
      {createCircleDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreateCircleDrawerOpen(false)} />
          <div className="absolute right-4 top-4 bottom-4 w-full max-w-xl bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Circle</h3>
              <button title="Close create circle drawer" onClick={() => setCreateCircleDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                <XIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Name</label>
                <input
                  type="text"
                  title="Create circle name"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder="Engineering Team"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Type</label>
                <select
                  title="Create circle type"
                  value={newCircleType}
                  onChange={(e) => setNewCircleType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                >
                  <option value="organization">Organization</option>
                  <option value="department">Department</option>
                  <option value="team">Team</option>
                  <option value="family">Family</option>
                  <option value="household">Household</option>
                  <option value="friend-group">Friend Group</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Pin Code</label>
                  <input
                    type="text"
                    title="Create circle pin code"
                    value={newCirclePinCode}
                    onChange={(e) => setNewCirclePinCode(e.target.value)}
                    placeholder="1234"
                    maxLength={10}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Code (Ref)</label>
                  <input
                    type="text"
                    title="Create circle ref code"
                    value={newCircleCode}
                    onChange={(e) => setNewCircleCode(e.target.value)}
                    placeholder="ENG-2024"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Parent Circle</label>
                <select
                  title="Create parent circle"
                  value={newCircleParentId}
                  onChange={(e) => setNewCircleParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                >
                  <option value="">None (root)</option>
                  {circles.map((circle) => (
                    <option key={circle.id} value={circle.id}>{circle.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Description</label>
                <textarea
                  title="Create circle description"
                  value={newCircleDescription}
                  onChange={(e) => setNewCircleDescription(e.target.value)}
                  rows={4}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm resize-y"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateCircleDrawerOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  await onCreateCircle()
                  setCreateCircleDrawerOpen(false)
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
              >
                Create Circle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Circle Detail Drawer */}
      {circleDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCircleDrawerOpen(false)} />
          <div className="absolute right-4 top-4 bottom-4 w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Circle Details</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedCircle?.id}</p>
              </div>
              <button title="Close circle drawer" onClick={() => setCircleDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                <XIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {circleDrawerLoading || !selectedCircle ? (
                <div className="text-sm text-gray-500">Loading circle detail...</div>
              ) : (
                <>
                  <div className="flex items-center gap-1 border-b border-gray-200 dark:border-zinc-800">
                    <button onClick={() => setCircleDetailTab('info')} className={`px-3 py-2 text-xs font-medium border-b-2 ${circleDetailTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Circle Info</button>
                    <button onClick={() => setCircleDetailTab('members')} className={`px-3 py-2 text-xs font-medium border-b-2 ${circleDetailTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Members</button>
                    <button onClick={() => setCircleDetailTab('billing')} className={`px-3 py-2 text-xs font-medium border-b-2 ${circleDetailTab === 'billing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Billing</button>
                  </div>

                  {circleDetailTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Name</label>
                        <input type="text" title="Circle detail name" value={circleDetailDraft.name} onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Type</label>
                        <select title="Circle detail type" value={circleDetailDraft.circleType} onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, circleType: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm">
                          <option value="organization">Organization</option>
                          <option value="department">Department</option>
                          <option value="team">Team</option>
                          <option value="family">Family</option>
                          <option value="household">Household</option>
                          <option value="friend-group">Friend Group</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Parent Circle</label>
                        <select title="Circle detail parent" value={circleDetailDraft.parentId} onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, parentId: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm">
                          <option value="">None</option>
                          {circles.filter((c) => c.id !== selectedCircle.id).map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Pin Code</label>
                        <input
                          type="text"
                          title="Circle detail pin code"
                          value={circleDetailDraft.pinCode || ''}
                          onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, pinCode: e.target.value }))}
                          placeholder="1234"
                          maxLength={10}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Circle Code (Ref)</label>
                        <input
                          type="text"
                          title="Circle detail ref code"
                          value={circleDetailDraft.circleCode || ''}
                          onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, circleCode: e.target.value }))}
                          placeholder="ENG-2024"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Description</label>
                        <textarea
                          title="Circle detail description"
                          value={circleDetailDraft.description}
                          onChange={(e) => setCircleDetailDraft(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm resize-y"
                        />
                      </div>
                    </div>
                  )}

                  {circleDetailTab === 'members' && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">Manage Members and Owners</p>
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_130px_110px] gap-2">
                          <div className="space-y-1">
                            <input
                              type="text"
                              list="circle-users-datalist"
                              value={circleUserSearch}
                              onChange={(e) => {
                                setCircleUserSearch(e.target.value)
                                const match = circleUserOptions.find(u => `${u.name || 'Unknown'} (${u.email || u.id})` === e.target.value)
                                setCircleSelectedUserId(match ? match.id : '')
                              }}
                              placeholder="Search and select user..."
                              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <datalist id="circle-users-datalist">
                              {circleUserOptions.map((u) => (
                                <option key={u.id} value={`${u.name || 'Unknown'} (${u.email || u.id})`} />
                              ))}
                            </datalist>
                          </div>
                          <select
                            title="Assign role"
                            value={circleSelectedRole}
                            onChange={(e) => setCircleSelectedRole(e.target.value as 'member' | 'owner')}
                            className="px-2.5 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs h-fit"
                          >
                            <option value="member">Member</option>
                            <option value="owner">Owner</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-fit"
                            disabled={!circleSelectedUserId}
                            onClick={() => onAssignCircleUser(selectedCircle.id)}
                          >
                            Add User
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-3">
                        <p className="text-xs font-semibold mb-2">Assigned Users</p>
                        <div className="space-y-2">
                          {[
                            ...(selectedCircle.members || []).map((m) => ({ id: m.id, userId: m.userId, email: m.user?.email || m.userId, role: 'member' as const })),
                            ...(selectedCircle.owners || []).map((o) => ({ id: o.id, userId: o.userId, email: o.user?.email || o.userId, role: 'owner' as const })),
                          ].map((entry) => (
                            <div key={`${entry.role}-${entry.id}`} className="text-xs grid grid-cols-[minmax(0,1fr)_110px_70px] gap-2 items-center">
                              <span className="truncate">{entry.email}</span>
                              <select
                                value={entry.role}
                                title="Assigned role"
                                onChange={(e) => onSwitchCircleUserRole(entry.userId, entry.role, e.target.value as 'member' | 'owner')}
                                className="px-2 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs"
                              >
                                <option value="member">Member</option>
                                <option value="owner">Owner</option>
                              </select>
                              <button
                                title="Remove user"
                                onClick={() => (entry.role === 'owner' ? onRemoveCircleOwner(entry.userId) : onRemoveCircleMember(entry.userId))}
                                className="text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {(selectedCircle.members || []).length === 0 && (selectedCircle.owners || []).length === 0 && (
                            <p className="text-xs text-gray-500">No users assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {circleDetailTab === 'billing' && (
                    <div className="space-y-4">
                      {circleBillingMode === 'perCircleLevel' ? (
                        <>
                          <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">Assign Billing User</p>
                            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px] gap-2">
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={circleBillingUserSearch}
                                  onChange={(e) => setCircleBillingUserSearch(e.target.value)}
                                  placeholder="Search user by name or email"
                                  className="w-full px-2.5 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs"
                                />
                                <select
                                  title="Select billing user"
                                  value={circleSelectedBillingUserId}
                                  onChange={(e) => setCircleSelectedBillingUserId(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs"
                                >
                                  <option value="">Select billing user...</option>
                                  {circleBillingUserOptions.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {(u.name || 'Unknown')} ({u.email || u.id})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <Button size="sm" variant="outline" className="h-fit" disabled={!circleSelectedBillingUserId} onClick={() => onAssignCircleBilling(selectedCircle.id)}>
                                Set Assignee
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-3">
                            <p className="text-xs font-semibold mb-2">Billing Assignees</p>
                            <div className="space-y-2">
                              {(selectedCircle.billingAssignees || []).map((b) => (
                                <div key={b.id} className="text-xs flex items-center justify-between gap-2">
                                  <span className="truncate">{b.user?.email || b.userId}{b.isPrimary ? ' (primary)' : ''}</span>
                                  <button title="Remove billing assignee" onClick={() => onRemoveCircleBillingAssignee(b.userId)} className="text-red-500 hover:text-red-600">Remove</button>
                                </div>
                              ))}
                              {(selectedCircle.billingAssignees || []).length === 0 && <p className="text-xs text-gray-500">No billing assignees</p>}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 text-xs text-gray-500">
                          Billing mode is currently per user account. Switch to per circle from the Billing tab to configure circle assignees.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onDeleteCircle(selectedCircle?.id || '')}
              >
                Delete Circle
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setCircleDrawerOpen(false)}>Close</Button>
                <Button onClick={onSaveCircleDetail} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">Save Circle</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

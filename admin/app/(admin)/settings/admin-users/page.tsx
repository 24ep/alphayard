'use client'

import React, { useEffect, useState } from 'react'
import { adminService, AdminUser, Role } from '../../../../services/adminService'
import { Card, CardBody } from '../../../../components/ui/Card'
import { Input } from '../../../../components/ui/Input'
import { Button } from '../../../../components/ui/Button'
import { 
    UserIcon, 
    ShieldCheckIcon,
    EnvelopeIcon,
    CalendarIcon,
    XMarkIcon,
    PlusIcon
} from '@heroicons/react/24/outline'
import { toast } from '../../../../src/hooks/use-toast'

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteForm, setInviteForm] = useState({ email: '', password: '', firstName: '', lastName: '', roleId: '' })
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [usersData, rolesData] = await Promise.all([
                adminService.getAdminUsers(),
                adminService.getRoles()
            ])
            setAdmins(usersData || [])
            setRoles(rolesData || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteForm.email || !inviteForm.password) {
            toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' })
            return
        }
        setInviting(true)
        try {
            await adminService.createAdminUser({
                email: inviteForm.email,
                password: inviteForm.password,
                firstName: inviteForm.firstName,
                lastName: inviteForm.lastName,
                roleId: inviteForm.roleId || undefined
            })
            toast({ title: 'Success', description: 'Admin user created successfully' })
            setShowInviteModal(false)
            setInviteForm({ email: '', password: '', firstName: '', lastName: '', roleId: '' })
            fetchData()
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to create admin', variant: 'destructive' })
        } finally {
            setInviting(false)
        }
    }

    const handleRevoke = async (admin: AdminUser) => {
        if (!confirm(`Are you sure you want to revoke access for ${admin.firstName} ${admin.lastName}?`)) return
        try {
            await adminService.deleteAdminUser(admin.id)
            toast({ title: 'Success', description: 'Admin access revoked' })
            fetchData()
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to revoke access', variant: 'destructive' })
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading administrators...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
                    <p className="text-gray-500">Manage system administrators and their permissions</p>
                </div>
                <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Invite Admin
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {admins.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                        No administrators found
                    </div>
                ) : admins.map((admin) => (
                    <Card key={admin.id} variant="frosted" className="hover:shadow-md transition-shadow">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        {admin.avatar ? (
                                            <img src={admin.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-6 h-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {admin.firstName} {admin.lastName}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            <ShieldCheckIcon className="w-3 h-3" />
                                            {admin.role?.replace('_', ' ') || 'admin'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${admin.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    {admin.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CalendarIcon className="w-4 h-4" />
                                    Joined {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                                <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                    Edit Settings
                                </button>
                                <button 
                                    onClick={() => handleRevoke(admin)}
                                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Revoke
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Invite Admin Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Invite Admin</h2>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="First Name" 
                                    value={inviteForm.firstName} 
                                    onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})}
                                    placeholder="John"
                                />
                                <Input 
                                    label="Last Name" 
                                    value={inviteForm.lastName} 
                                    onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})}
                                    placeholder="Doe"
                                />
                            </div>
                            <Input 
                                label="Email" 
                                type="email"
                                value={inviteForm.email} 
                                onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                                placeholder="admin@example.com"
                            />
                            <Input 
                                label="Password" 
                                type="password"
                                value={inviteForm.password} 
                                onChange={e => setInviteForm({...inviteForm, password: e.target.value})}
                                placeholder="Minimum 8 characters"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select 
                                    value={inviteForm.roleId}
                                    onChange={e => setInviteForm({...inviteForm, roleId: e.target.value})}
                                    className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setShowInviteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                                onClick={handleInvite}
                                disabled={inviting}
                            >
                                {inviting ? 'Creating...' : 'Create Admin'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

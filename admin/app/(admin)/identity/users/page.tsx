'use client'

import React, { useEffect, useState } from 'react'
import { GlobalUser, userService } from '../../../../services/userService'
import { UserList } from '../../../../components/identity/UserList'
import { UserDetailDrawer } from '../../../../components/identity/UserDetailDrawer'
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function GlobalUsersPage() {
    const [users, setUsers] = useState<GlobalUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await userService.getUsers()
            setUsers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUserUpdated = () => {
        loadUsers() // Reload list to reflect changes
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">User Identities</h1>
                    <p className="text-gray-500 text-xs mt-1">Manage global identities, access, and attributes across all applications.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
                        <PlusIcon className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            <UserList 
                users={users} 
                loading={loading} 
                onUserClick={(user) => setSelectedUserId(user.id)} 
            />

            <UserDetailDrawer 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
                onUserUpdated={handleUserUpdated}
            />
        </div>
    )
}

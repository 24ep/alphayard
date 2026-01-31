"use client";

import React, { useState, useEffect } from 'react'
import { authService } from '../../../services/authService'
import { adminService, DashboardStats } from '../../../services/adminService'
import { API_BASE_URL } from '../../../services/apiConfig'
import { 
    MetricCard, 
    SkeletonWrapper, 
    MobileSkeleton, 
    StatisticRoll,
    StatusIndicator,
    Card,
    CardHeader,
    CardTitle,
    CardBody
} from '../../../components/ui'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../src/hooks/use-toast'
import { 
    Layout, 
    FileText, 
    Eye, 
    CheckCircle, 
    Rocket, 
    Zap,
    Pencil, 
    User as UserIcon, 
    MapPin, 
    Plus,
    Cloud,
    TrendingUp,
    Shield,
    Users,
    RefreshCw,
    Smartphone,
    ArrowRight,
    Activity
} from 'lucide-react'
import { clsx } from 'clsx'

interface DashboardStatsDisplay {
    totalUsers: number
    totalContent: number
    totalViews: number
    activeUsers: number
    totalScreens: number
    recentScreens: any[]
}

interface RecentActivity {
    id: string
    type: 'publish' | 'create' | 'update' | 'login'
    title: string
    timestamp: string
    user: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStatsDisplay>({
        totalUsers: 0,
        totalContent: 0,
        totalViews: 0,
        activeUsers: 0,
        totalScreens: 0,
        recentScreens: []
    })
    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const data = await adminService.getDashboardStats()
            
            // Get screen details
            const appsResponse = await adminService.getApplications()
            const activeApp = appsResponse.applications.find(a => a.is_active)
            const screens = activeApp?.branding?.screens || []

            setStats({
                totalUsers: data.totalUsers,
                totalContent: 48, 
                totalViews: 12540,
                activeUsers: data.activeUsers,
                totalScreens: data.totalScreens,
                recentScreens: screens.slice(-4).reverse() // Show last 4 extracted
            })

            setActivities([
                { id: '1', type: 'publish', title: 'Home Page Updated', timestamp: '2 hours ago', user: 'Admin' },
                { id: '2', type: 'create', title: 'New Blog Post', timestamp: '4 hours ago', user: 'Editor' },
                { id: '3', type: 'login', title: 'User Login', timestamp: '5 hours ago', user: 'admin@appkit.com' },
                { id: '4', type: 'update', title: 'Settings Modified', timestamp: '1 day ago', user: 'Admin' }
            ])
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const handleSync = async () => {
        try {
            setSyncing(true)
            const res = await adminService.seedScreens()
            toast({ title: "Sync Complete", description: res.message })
            await fetchDashboardData()
        } catch (error) {
            toast({ title: "Sync Failed", variant: "destructive" })
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="space-y-8 p-4 md:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
                        <StatusIndicator status="online" pulse size="sm" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Welcome back! Here's your premium snapshot.</p>
                </div>
                <div className="flex items-center gap-3">
                   <Button 
                    variant="secondary" 
                    size="sm" 
                    className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-300"
                    onClick={handleSync}
                    disabled={syncing}
                   >
                       <RefreshCw className={clsx("w-4 h-4 mr-1.5", syncing && "animate-spin")} />
                       {syncing ? 'Syncing...' : 'Sync Mobile'}
                   </Button>
                   <Button variant="primary" size="sm" className="rounded-xl shadow-lg shadow-blue-500/20 px-4">
                      <Plus className="w-4 h-4 mr-1.5" /> Create
                   </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <SkeletonWrapper 
                    isLoading={loading} 
                    skeleton={<MobileSkeleton className="h-40 rounded-3xl" />}
                >
                    <MetricCard
                        title="Total Users"
                        value={<StatisticRoll value={stats.totalUsers} />}
                        variant="primary"
                        icon={<Users className="w-5 h-5" />}
                        trend={{ value: "12%", isUp: true }}
                        sparkle
                    />
                </SkeletonWrapper>
                <SkeletonWrapper 
                    isLoading={loading} 
                    skeleton={<MobileSkeleton className="h-40 rounded-3xl" />}
                >
                    <MetricCard
                        title="Content items"
                        value={<StatisticRoll value={stats.totalContent} />}
                        variant="indigo"
                        icon={<FileText className="w-5 h-5" />}
                        trend={{ value: "5", isUp: true }}
                    />
                </SkeletonWrapper>
                <SkeletonWrapper 
                    isLoading={loading} 
                    skeleton={<MobileSkeleton className="h-40 rounded-3xl" />}
                >
                    <MetricCard
                        title="Total Engagement"
                        value={<StatisticRoll value={stats.totalViews} suffix="+" />}
                        variant="success"
                        icon={<TrendingUp className="w-5 h-5" />}
                        trend={{ value: "24%", isUp: true }}
                    />
                </SkeletonWrapper>
                <SkeletonWrapper 
                    isLoading={loading} 
                    skeleton={<MobileSkeleton className="h-40 rounded-3xl" />}
                >
                    <MetricCard
                        title="Mobile Screens"
                        value={<StatisticRoll value={stats.totalScreens} />}
                        variant="warning"
                        icon={<Layout className="w-5 h-5 text-orange-400" />}
                        subtitle={`${stats.totalScreens} components extracted`}
                    />
                </SkeletonWrapper>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-6">
                {/* Activities & Screenshots */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[40px] border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="p-8 pb-4 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    Recent Activity
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">View All</Button>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">
                            {activities.map((activity, idx) => (
                                <div key={activity.id} className={clsx(
                                    "p-6 flex items-center justify-between transition-colors hover:bg-white/5 group",
                                    idx !== activities.length - 1 && "border-b border-white/5"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center",
                                            activity.type === 'publish' ? "bg-green-500/20 text-green-400" :
                                            activity.type === 'create' ? "bg-blue-500/20 text-blue-400" :
                                            "bg-purple-500/20 text-purple-400"
                                        )}>
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{activity.title}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{activity.user} • {activity.timestamp}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Details
                                    </Button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </div>

                {/* Mobile Screen Previews */}
                <div className="space-y-6">
                    <Card className="rounded-[40px] border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden h-full">
                        <CardHeader className="p-8 pb-4 border-b border-white/5">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                Extracted Screens
                            </CardTitle>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                {stats.recentScreens.length > 0 ? (
                                    stats.recentScreens.map((screen) => (
                                        <div key={screen.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                            <div className="w-10 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                                <Layout className="w-5 h-5 text-slate-600 group-hover:text-orange-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{screen.name}</p>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase">{screen.id}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <Smartphone className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-20" />
                                        <p className="text-slate-500 text-sm">No screens extracted yet.</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-4 rounded-xl border-slate-800"
                                            onClick={handleSync}
                                        >
                                            Start Extraction
                                        </Button>
                                    </div>
                                )}
                                
                                {stats.recentScreens.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        className="w-full mt-4 text-slate-400 hover:text-white text-sm font-bold py-6 rounded-2xl border-2 border-dashed border-white/5 hover:border-white/10"
                                        onClick={() => window.location.href = '/navigation?tab=screens'}
                                    >
                                        Manage All {stats.totalScreens} Screens
                                    </Button>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
            {/* Quick Actions */}
                <Card className="rounded-3xl border-slate-800 bg-slate-900/40 backdrop-blur-xl">
                    <CardBody className="p-7">
                        <div className="pb-5 mb-6 border-b border-slate-800">
                            <h2 className="text-base font-black text-white tracking-tight uppercase text-[10px] text-slate-500 tracking-widest">Platform Actions</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickActionButton icon={<Plus className="w-5 h-5 text-blue-400" />} label="New Page" href="/pages" />
                            <QuickActionButton icon={<FileText className="w-5 h-5 text-indigo-400" />} label="New Content" href="/content" />
                            <QuickActionButton icon={<Users className="w-5 h-5 text-green-400" />} label="Add User" href="/admin/users" />
                            <QuickActionButton icon={<Cloud className="w-5 h-5 text-purple-400" />} label="Upload Media" href="/media" />
                        </div>
                        
                        <div className="mt-8 p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10">
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-80">Infrastructure Sync</h4>
                              <span className="text-[10px] font-bold text-indigo-500">75%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full w-3/4 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                           </div>
                           <p className="mt-3 text-[10px] text-slate-500 font-medium">Cloud nodes are scaling correctly in US-East-1.</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

// Quick Action Button Component
function QuickActionButton({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <a
            href={href}
            className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 group shadow-sm"
        >
            <span className="mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">{icon}</span>
            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors tracking-tight">{label}</span>
        </a>
    )
}

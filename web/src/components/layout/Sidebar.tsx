'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  FolderIcon,
  SparklesIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Circle', href: '/dashboard/Circle', icon: UserGroupIcon },
  { name: 'Social', href: '/dashboard/social', icon: ChatBubbleLeftRightIcon },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckCircleIcon },
  { name: 'Gallery', href: '/dashboard/gallery', icon: PhotoIcon },
  { name: 'Notes', href: '/dashboard/notes', icon: DocumentTextIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Safety', href: '/dashboard/safety', icon: ShieldCheckIcon },
  { name: 'Storage', href: '/dashboard/storage', icon: FolderIcon },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: SparklesIcon },
]

const advancedFeatures = [
  { name: 'Advanced Calendar', href: '/dashboard/calendar/advanced', icon: CalendarDaysIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Advanced Social', href: '/dashboard/social/advanced', icon: UserGroupIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white/70 backdrop-blur-macos border-r border-gray-200 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-macos-blue-500 to-macos-blue-600 rounded-macos flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="font-semibold text-gray-900">Bondarys</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-macos text-sm font-medium transition-macos',
                  isActive
                    ? 'bg-macos-blue-50 text-macos-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="mt-8">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Advanced
          </p>
          {advancedFeatures.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-macos text-sm font-medium transition-macos',
                  isActive
                    ? 'bg-macos-blue-50 text-macos-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-macos text-sm font-medium text-gray-700 hover:bg-gray-100 transition-macos"
        >
          <UserCircleIcon className="w-5 h-5" />
          Profile
        </Link>
      </div>
    </div>
  )
}



'use client'

import { useDataRoomStore } from '@/store/data-room-store'
import { LoginView } from './LoginView'
import { DashboardView } from './DashboardView'
import { DocumentsView } from './DocumentsView'
import { AdminView } from './AdminView'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export function DataRoomApp() {
  const { isAuthenticated, currentUser, currentView, setCurrentView, logout } = useDataRoomStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <LoginView />
  }

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'documents':
        return <DocumentsView />
      case 'admin':
        return <AdminView />
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
              <p className="text-stone-400">Account settings will be available here.</p>
            </div>
          </div>
        )
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-stone-800 rounded-lg text-white"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-stone-900/80 border-r border-stone-700 backdrop-blur
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-stone-700">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-lg font-bold text-white">Aurora</h1>
                <p className="text-xs text-stone-400">Data Room</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors text-left
                  ${currentView === item.id 
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' 
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-stone-700">
            <div className="mb-4 px-2">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.name || currentUser?.email}
              </p>
              <p className="text-xs text-stone-400">
                {currentUser?.role}
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-stone-600 text-stone-300 hover:bg-red-900/20 hover:text-red-400 hover:border-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

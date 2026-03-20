'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/lib/auth';
import { DocumentsView } from './DocumentsView';
import { AdminConsole } from './AdminConsole';
import { AuroraLogo } from './AuroraLogo';
import { 
  LogOut, 
  FileText, 
  Settings, 
  Users, 
  Shield,
  FolderOpen
} from 'lucide-react';

interface DashboardViewProps {
  user: SessionUser;
  onLogout: () => void;
}

export function DashboardView({ user, onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('documents');
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-600';
      case 'ADMIN': return 'bg-orange-600';
      case 'REVIEWER': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AuroraLogo className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-bold text-white">Aurora Data Room</h1>
              <p className="text-xs text-slate-400">Secure Document Access</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name || user.email}</p>
              <div className="flex items-center justify-end gap-2">
                <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                  {user.role.replace('_', ' ')}
                </Badge>
                {user.company && (
                  <span className="text-xs text-slate-400">{user.company}</span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700 mb-6">
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Console
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="documents">
            <DocumentsView user={user} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminConsole user={user} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-center text-sm text-slate-500">
            &copy; 2026 Aurora OSI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

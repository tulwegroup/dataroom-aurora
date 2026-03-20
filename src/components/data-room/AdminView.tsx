'use client'

import { useEffect, useState } from 'react'
import { useDataRoomStore, type AccessRequest, type DataRoomUser } from '@/store/data-room-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Users, 
  FileText, 
  Shield, 
  Settings,
  UserPlus,
  Check,
  X,
  MoreHorizontal,
  Loader2,
  Mail,
  Clock,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminView() {
  const { setCurrentView, currentUser } = useDataRoomStore()
  const [activeTab, setActiveTab] = useState('requests')
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [users, setUsers] = useState<DataRoomUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    company: '',
    role: 'VIEWER' as const,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, usersRes] = await Promise.all([
          fetch('/api/data-room/access-requests'),
          fetch('/api/data-room/users'),
        ])
        
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          setAccessRequests(data.requests)
        }
        
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleApproveRequest = async (request: AccessRequest) => {
    try {
      const response = await fetch(`/api/data-room/access-requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedTier: request.requestedTier }),
      })
      
      if (response.ok) {
        setAccessRequests(prev => prev.filter(r => r.id !== request.id))
        // Refresh users
        const usersRes = await fetch('/api/data-room/users')
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users)
        }
      }
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return
    
    try {
      const response = await fetch(`/api/data-room/access-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      
      if (response.ok) {
        setAccessRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
        setRejectDialogOpen(false)
        setSelectedRequest(null)
        setRejectReason('')
      }
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/data-room/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(prev => [...prev, data.user])
        setAddUserDialogOpen(false)
        setNewUser({ email: '', name: '', company: '', role: 'VIEWER' })
      }
    } catch (error) {
      console.error('Failed to add user:', error)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/data-room/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        ))
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-600/20 text-amber-400 border-amber-600/30'
      case 'APPROVED': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'REJECTED': return 'bg-red-600/20 text-red-400 border-red-600/30'
      default: return 'bg-stone-600/20 text-stone-400 border-stone-600/30'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'ADMIN': return 'bg-amber-600/20 text-amber-400 border-amber-600/30'
      case 'REVIEWER': return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'VIEWER': return 'bg-green-600/20 text-green-400 border-green-600/30'
      default: return 'bg-stone-600/20 text-stone-400 border-stone-600/30'
    }
  }

  if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
    return (
      <Card className="bg-stone-900/50 border-stone-700">
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-stone-400">You don't have permission to access the admin console.</p>
          <Button onClick={() => setCurrentView('dashboard')} className="mt-4 bg-amber-600 hover:bg-amber-700">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('dashboard')}
            className="text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Console</h1>
            <p className="text-stone-400">Manage users, documents, and access controls</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-800/50">
          <TabsTrigger value="requests" className="data-[state=active]:bg-amber-600">
            <Mail className="w-4 h-4 mr-2" />
            Access Requests
            {accessRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {accessRequests.filter(r => r.status === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-amber-600">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-amber-600">
            <Clock className="w-4 h-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Access Requests Tab */}
        <TabsContent value="requests">
          <Card className="bg-stone-900/50 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Access Requests</CardTitle>
              <CardDescription className="text-stone-400">
                Review and manage access requests from potential users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : accessRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto text-stone-600 mb-4" />
                  <p className="text-stone-400">No access requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-700">
                      <TableHead className="text-stone-400">Requester</TableHead>
                      <TableHead className="text-stone-400">Company</TableHead>
                      <TableHead className="text-stone-400">Requested Tier</TableHead>
                      <TableHead className="text-stone-400">Status</TableHead>
                      <TableHead className="text-stone-400">Date</TableHead>
                      <TableHead className="text-stone-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRequests.map((request) => (
                      <TableRow key={request.id} className="border-stone-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{request.name}</p>
                            <p className="text-sm text-stone-400">{request.email}</p>
                            {request.title && (
                              <p className="text-xs text-stone-500">{request.title}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-stone-300">{request.company}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(request.requestedTier)}>
                            {request.requestedTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-stone-300">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproveRequest(request)}
                                className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setRejectDialogOpen(true)
                                }}
                                className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-stone-900/50 border-stone-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-stone-400">
                  Manage user accounts and permissions
                </CardDescription>
              </div>
              <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-stone-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New User</DialogTitle>
                    <DialogDescription className="text-stone-400">
                      Create a new user account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-stone-300">Email</Label>
                      <Input
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-stone-800 border-stone-600 text-white"
                        placeholder="user@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-stone-300">Name</Label>
                      <Input
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-stone-800 border-stone-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-stone-300">Company</Label>
                      <Input
                        value={newUser.company}
                        onChange={(e) => setNewUser(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-stone-800 border-stone-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-stone-300">Role</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v as typeof newUser.role }))}
                      >
                        <SelectTrigger className="bg-stone-800 border-stone-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-600">
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="REVIEWER">Reviewer</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          {currentUser?.role === 'SUPER_ADMIN' && (
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddUserDialogOpen(false)} className="border-stone-600 text-stone-300">
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} className="bg-amber-600 hover:bg-amber-700">
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-700">
                      <TableHead className="text-stone-400">User</TableHead>
                      <TableHead className="text-stone-400">Company</TableHead>
                      <TableHead className="text-stone-400">Role</TableHead>
                      <TableHead className="text-stone-400">Status</TableHead>
                      <TableHead className="text-stone-400">Last Login</TableHead>
                      <TableHead className="text-stone-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-stone-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{user.name || 'No name'}</p>
                            <p className="text-sm text-stone-400">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-stone-300">{user.company || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={user.isActive 
                            ? 'bg-green-600/20 text-green-400 border-green-600/30'
                            : 'bg-red-600/20 text-red-400 border-red-600/30'
                          }>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-stone-300">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-stone-800 border-stone-700">
                              <DropdownMenuItem className="text-stone-300 hover:bg-stone-700 hover:text-white">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                className="text-stone-300 hover:bg-stone-700 hover:text-white"
                              >
                                {user.isActive ? (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <Card className="bg-stone-900/50 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">Audit Logs</CardTitle>
              <CardDescription className="text-stone-400">
                Track all user activity and document access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-stone-600 mb-4" />
                <p className="text-stone-400">Audit logs will be displayed here</p>
                <p className="text-sm text-stone-500 mt-2">
                  All document views, downloads, and user actions are tracked
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Access Request</DialogTitle>
            <DialogDescription className="text-stone-400">
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="bg-stone-800 border-stone-600 text-white min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="border-stone-600 text-stone-300">
              Cancel
            </Button>
            <Button onClick={handleRejectRequest} className="bg-red-600 hover:bg-red-700">
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

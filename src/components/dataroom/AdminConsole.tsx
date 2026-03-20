'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  FileUp, 
  Settings, 
  UserPlus,
  Upload,
  Check,
  X,
  Clock,
  Mail
} from 'lucide-react';
import { SessionUser } from '@/lib/auth';

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  company: string;
  status: string;
  requestedTier: string;
  createdAt: string;
}

interface DataRoomUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminConsoleProps {
  user: SessionUser;
}

export function AdminConsole({ user }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<DataRoomUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dealRooms, setDealRooms] = useState<Array<{id: string; name: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    dealRoomId: '',
    accessTier: 'TEASER',
    category: '',
    file: null as File | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, usersRes, dealRoomsRes] = await Promise.all([
        fetch('/api/access-requests'),
        fetch('/api/users'),
        fetch('/api/dealrooms')
      ]);
      
      const requestsData = await requestsRes.json();
      const usersData = await usersRes.json();
      const dealRoomsData = await dealRoomsRes.json();
      
      setAccessRequests(requestsData.requests || []);
      setUsers(usersData.users || []);
      setDealRooms(dealRoomsData.dealRooms || []);
      
      if (dealRoomsData.dealRooms?.length > 0) {
        setUploadForm(prev => ({ ...prev, dealRoomId: dealRoomsData.dealRooms[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, tier: string) => {
    try {
      const res = await fetch(`/api/access-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessTier: tier })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/access-requests/${requestId}/reject`, {
        method: 'POST'
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ 
        ...prev, 
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.dealRoomId) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('dealRoomId', uploadForm.dealRoomId);
      formData.append('accessTier', uploadForm.accessTier);
      formData.append('category', uploadForm.category);
      
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setUploadForm({
          title: '',
          description: '',
          dealRoomId: dealRooms[0]?.id || '',
          accessTier: 'TEASER',
          category: '',
          file: null
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        alert('Document uploaded successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'TEASER': return 'bg-green-600';
      case 'QUALIFIED': return 'bg-blue-600';
      case 'TRANSACTION': return 'bg-purple-600';
      default: return 'bg-slate-600';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-600';
      case 'ADMIN': return 'bg-orange-600';
      case 'REVIEWER': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="bg-slate-800 border-slate-700 mb-6">
        <TabsTrigger 
          value="requests"
          className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <Mail className="h-4 w-4 mr-2" />
          Access Requests
          {accessRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <Badge className="ml-2 bg-red-600">
              {accessRequests.filter(r => r.status === 'PENDING').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="users"
          className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </TabsTrigger>
        <TabsTrigger 
          value="upload"
          className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload Documents
        </TabsTrigger>
      </TabsList>

      {/* Access Requests Tab */}
      <TabsContent value="requests">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pending Access Requests</CardTitle>
            <CardDescription className="text-slate-400">
              Review and approve or reject access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accessRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No access requests</p>
            ) : (
              <div className="space-y-4">
                {accessRequests.map(request => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{request.name}</span>
                        <Badge className={getTierBadgeColor(request.requestedTier)}>
                          {request.requestedTier}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={request.status === 'PENDING' 
                            ? 'border-yellow-500 text-yellow-500' 
                            : request.status === 'APPROVED'
                              ? 'border-green-500 text-green-500'
                              : 'border-red-500 text-red-500'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {request.email} • {request.company}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveRequest(request.id, request.requestedTier)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Users Tab */}
      <TabsContent value="users">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Data Room Users</CardTitle>
            <CardDescription className="text-slate-400">
              Manage user access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map(u => (
                <div 
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{u.name || u.email}</span>
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {u.role.replace('_', ' ')}
                      </Badge>
                      {!u.isActive && (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {u.email} {u.company && `• ${u.company}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Upload Documents Tab */}
      <TabsContent value="upload">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Document</CardTitle>
            <CardDescription className="text-slate-400">
              Add new documents to the data room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Document Title</Label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Deal Room</Label>
                  <select
                    value={uploadForm.dealRoomId}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, dealRoomId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  >
                    {dealRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Access Tier</Label>
                  <select
                    value={uploadForm.accessTier}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, accessTier: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="TEASER">Teaser</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="TRANSACTION">Transaction</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Category</Label>
                  <Input
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Financial, Legal, Technical"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <Input
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-amber-600 file:text-white file:cursor-pointer"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

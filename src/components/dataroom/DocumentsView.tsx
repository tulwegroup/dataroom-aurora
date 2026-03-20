'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionUser } from '@/lib/auth';
import { 
  FileText, 
  Download, 
  Eye, 
  Lock, 
  FolderOpen,
  Calendar,
  FileIcon
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  accessTier: string;
  category: string | null;
  createdAt: string;
  dealRoom: {
    id: string;
    name: string;
  };
}

interface DocumentsViewProps {
  user: SessionUser;
}

export function DocumentsView({ user }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dealRooms, setDealRooms] = useState<Array<{id: string; name: string}>>([]);
  const [selectedDealRoom, setSelectedDealRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealRooms();
  }, []);

  useEffect(() => {
    if (selectedDealRoom) {
      fetchDocuments();
    }
  }, [selectedDealRoom]);

  const fetchDealRooms = async () => {
    try {
      const res = await fetch('/api/dealrooms');
      const data = await res.json();
      setDealRooms(data.dealRooms || []);
      if (data.dealRooms?.length > 0) {
        setSelectedDealRoom(data.dealRooms[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch deal rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!selectedDealRoom) return;
    
    try {
      const res = await fetch(`/api/documents?dealRoomId=${selectedDealRoom}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAccessTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'TEASER': return 'bg-green-600';
      case 'QUALIFIED': return 'bg-blue-600';
      case 'TRANSACTION': return 'bg-purple-600';
      default: return 'bg-slate-600';
    }
  };

  const canAccessDocument = (docTier: string) => {
    const userTiers = user.accessGrants
      .filter(g => g.dealRoomId === selectedDealRoom)
      .map(g => g.accessTier);
    
    if (userTiers.length === 0) return false;
    
    const tierOrder = { TEASER: 1, QUALIFIED: 2, TRANSACTION: 3 };
    const maxUserTier = Math.max(...userTiers.map(t => tierOrder[t as keyof typeof tierOrder]));
    
    return maxUserTier >= tierOrder[docTier as keyof typeof tierOrder];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deal Room Selector */}
      {dealRooms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {dealRooms.map(room => (
            <Button
              key={room.id}
              variant={selectedDealRoom === room.id ? 'default' : 'outline'}
              onClick={() => setSelectedDealRoom(room.id)}
              className={selectedDealRoom === room.id 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'border-slate-600 text-slate-300'
              }
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {room.name}
            </Button>
          ))}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Documents Available</h3>
            <p className="text-slate-400">
              There are no documents available in this data room yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map(doc => {
            const hasAccess = canAccessDocument(doc.accessTier);
            
            return (
              <Card 
                key={doc.id} 
                className={`bg-slate-800/50 border-slate-700 ${!hasAccess ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-500" />
                      <Badge className={getAccessTierBadgeColor(doc.accessTier)}>
                        {doc.accessTier}
                      </Badge>
                    </div>
                    {doc.category && (
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {doc.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-base mt-2 line-clamp-2">
                    {doc.title}
                  </CardTitle>
                  {doc.description && (
                    <CardDescription className="text-slate-400 line-clamp-2">
                      {doc.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>{doc.fileName}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {hasAccess ? (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        disabled
                        className="flex-1 bg-slate-700 text-slate-400"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Access Required
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

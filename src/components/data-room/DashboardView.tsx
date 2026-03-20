'use client'

import { useEffect, useState } from 'react'
import { useDataRoomStore, type DealRoom } from '@/store/data-room-store'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FolderOpen, 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  ArrowRight,
  Loader2
} from 'lucide-react'

export function DashboardView() {
  const { currentUser, dealRooms, setDealRooms, setCurrentView, setSelectedDealRoom } = useDataRoomStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeDealRooms: 0,
    pendingRequests: 0,
    recentActivity: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealRoomsRes, statsRes] = await Promise.all([
          fetch('/api/data-room/deal-rooms'),
          fetch('/api/data-room/stats'),
        ])
        
        if (dealRoomsRes.ok) {
          const data = await dealRoomsRes.json()
          setDealRooms(data.dealRooms)
        }
        
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [setDealRooms])

  const handleDealRoomSelect = (dealRoom: DealRoom) => {
    setSelectedDealRoom(dealRoom)
    setCurrentView('documents')
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'TEASER': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'QUALIFIED': return 'bg-amber-600/20 text-amber-400 border-amber-600/30'
      case 'TRANSACTION': return 'bg-red-600/20 text-red-400 border-red-600/30'
      default: return 'bg-stone-600/20 text-stone-400 border-stone-600/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {currentUser?.name || currentUser?.email}
          </h1>
          <p className="text-stone-400 mt-1">
            Access your secure documents and deal rooms
          </p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
          <Button 
            onClick={() => setCurrentView('admin')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Console
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-stone-900/50 border-stone-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-400 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Deal Rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeDealRooms}</div>
            <p className="text-xs text-stone-500 mt-1">Active rooms</p>
          </CardContent>
        </Card>
        
        <Card className="bg-stone-900/50 border-stone-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalDocuments}</div>
            <p className="text-xs text-stone-500 mt-1">Available to you</p>
          </CardContent>
        </Card>
        
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
          <Card className="bg-stone-900/50 border-stone-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-stone-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Access Requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.pendingRequests}</div>
              <p className="text-xs text-stone-500 mt-1">Pending review</p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-stone-900/50 border-stone-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-white">
              {currentUser?.lastLoginAt 
                ? new Date(currentUser.lastLoginAt).toLocaleDateString()
                : 'First login'}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {currentUser?.lastLoginAt 
                ? new Date(currentUser.lastLoginAt).toLocaleTimeString()
                : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Rooms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Deal Rooms</h2>
        </div>
        
        {dealRooms.length === 0 ? (
          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-stone-600 mb-4" />
              <p className="text-stone-400">No deal rooms available</p>
              <p className="text-sm text-stone-500 mt-1">
                Contact your administrator for access
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealRooms.map((dealRoom) => (
              <Card 
                key={dealRoom.id} 
                className="bg-stone-900/50 border-stone-700 hover:border-amber-600/50 transition-colors cursor-pointer"
                onClick={() => handleDealRoomSelect(dealRoom)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">{dealRoom.name}</CardTitle>
                    <Badge variant="outline" className={getTierBadgeColor(dealRoom.status)}>
                      {dealRoom.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-stone-400">
                    {dealRoom.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-stone-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {dealRoom.documentCount || 0} docs
                    </span>
                    {dealRoom.validUntil && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Until {new Date(dealRoom.validUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-amber-500 hover:text-amber-400 hover:bg-stone-800">
                    Access Room
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

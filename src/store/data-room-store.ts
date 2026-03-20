import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'REVIEWER' | 'VIEWER'
export type AccessTier = 'TEASER' | 'QUALIFIED' | 'TRANSACTION'
export type DocumentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ARCHIVED' | 'REVOKED'

export interface DataRoomUser {
  id: string
  email: string
  name: string | null
  company: string | null
  title: string | null
  role: UserRole
  accessTier?: AccessTier // User's default access tier
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface DealRoom {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  validFrom: string | null
  validUntil: string | null
  documentCount?: number
}

export interface Document {
  id: string
  dealRoomId: string
  title: string
  description: string | null
  fileName: string
  fileSize: number
  mimeType: string
  accessTier: AccessTier
  status: DocumentStatus
  category: string | null
  tags: string[]
  version: number
  hasWatermark: boolean
  createdAt: string
  uploadedBy: string | null
}

export interface AuditLogEntry {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  details: string | null
  createdAt: string
  userName?: string
}

export interface AccessRequest {
  id: string
  email: string
  name: string
  company: string
  title: string | null
  requestedTier: AccessTier
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  message: string | null
  createdAt: string
}

interface DataRoomState {
  // Auth state
  isAuthenticated: boolean
  currentUser: DataRoomUser | null
  authToken: string | null
  
  // UI state
  currentView: 'login' | 'dashboard' | 'documents' | 'admin' | 'requests' | 'audit' | 'settings'
  selectedDealRoom: DealRoom | null
  selectedDocument: Document | null
  
  // Data
  dealRooms: DealRoom[]
  documents: Document[]
  users: DataRoomUser[]
  accessRequests: AccessRequest[]
  auditLogs: AuditLogEntry[]
  
  // Actions
  login: (user: DataRoomUser, token: string) => void
  logout: () => void
  setCurrentView: (view: DataRoomState['currentView']) => void
  setSelectedDealRoom: (dealRoom: DealRoom | null) => void
  setSelectedDocument: (document: Document | null) => void
  setDealRooms: (dealRooms: DealRoom[]) => void
  setDocuments: (documents: Document[]) => void
  setUsers: (users: DataRoomUser[]) => void
  setAccessRequests: (requests: AccessRequest[]) => void
  setAuditLogs: (logs: AuditLogEntry[]) => void
}

export const useDataRoomStore = create<DataRoomState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      currentUser: null,
      authToken: null,
      currentView: 'login',
      selectedDealRoom: null,
      selectedDocument: null,
      dealRooms: [],
      documents: [],
      users: [],
      accessRequests: [],
      auditLogs: [],
      
      // Actions
      login: (user, token) => set({
        isAuthenticated: true,
        currentUser: user,
        authToken: token,
        currentView: 'dashboard'
      }),
      
      logout: () => set({
        isAuthenticated: false,
        currentUser: null,
        authToken: null,
        currentView: 'login',
        selectedDealRoom: null,
        selectedDocument: null
      }),
      
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedDealRoom: (dealRoom) => set({ selectedDealRoom: dealRoom }),
      setSelectedDocument: (document) => set({ selectedDocument: document }),
      setDealRooms: (dealRooms) => set({ dealRooms }),
      setDocuments: (documents) => set({ documents }),
      setUsers: (users) => set({ users }),
      setAccessRequests: (accessRequests) => set({ accessRequests }),
      setAuditLogs: (auditLogs) => set({ auditLogs }),
    }),
    {
      name: 'aurora-data-room-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        authToken: state.authToken,
      }),
    }
  )
)

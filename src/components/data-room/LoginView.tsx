'use client'

import { useState } from 'react'
import { useDataRoomStore, type AccessTier } from '@/store/data-room-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Mail, User, Building, Phone, FileText, AlertCircle, Loader2 } from 'lucide-react'

export function LoginView() {
  const login = useDataRoomStore((state) => state.login)
  
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // Request access form
  const [requestName, setRequestName] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestCompany, setRequestCompany] = useState('')
  const [requestTitle, setRequestTitle] = useState('')
  const [requestPhone, setRequestPhone] = useState('')
  const [requestTier, setRequestTier] = useState<AccessTier>('TEASER')
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    
    try {
      const response = await fetch('/api/data-room/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      login(data.user, data.token)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestLoading(true)
    
    try {
      const response = await fetch('/api/data-room/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestName,
          email: requestEmail,
          company: requestCompany,
          title: requestTitle,
          phone: requestPhone,
          requestedTier: requestTier,
          message: requestMessage,
        }),
      })
      
      if (response.ok) {
        setRequestSubmitted(true)
      }
    } catch (error) {
      console.error('Request submission failed:', error)
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-amber-500" />
            <span className="text-2xl font-bold text-white">Aurora Data Room</span>
          </div>
          <p className="text-stone-400 text-sm">
            Secure Document Access Platform
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-stone-800/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="request" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Request Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-stone-900/80 border-stone-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  Secure Login
                </CardTitle>
                <CardDescription className="text-stone-400">
                  Enter your credentials to access the data room
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-stone-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-stone-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <Card className="bg-stone-900/80 border-stone-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Request Access
                </CardTitle>
                <CardDescription className="text-stone-400">
                  Submit a request to access confidential documents
                </CardDescription>
              </CardHeader>
              
              {requestSubmitted ? (
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/50 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Request Submitted</h3>
                    <p className="text-stone-400 text-sm">
                      Your access request has been submitted. Our team will review your request and contact you at {requestEmail}.
                    </p>
                  </div>
                </CardContent>
              ) : (
                <form onSubmit={handleRequestAccess}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="req-name" className="text-stone-300">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          <Input
                            id="req-name"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-email" className="text-stone-300">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          <Input
                            id="req-email"
                            type="email"
                            value={requestEmail}
                            onChange={(e) => setRequestEmail(e.target.value)}
                            className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="req-company" className="text-stone-300">Company *</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          <Input
                            id="req-company"
                            value={requestCompany}
                            onChange={(e) => setRequestCompany(e.target.value)}
                            className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-title" className="text-stone-300">Title</Label>
                        <Input
                          id="req-title"
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          className="bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="req-phone" className="text-stone-300">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                          <Input
                            id="req-phone"
                            type="tel"
                            value={requestPhone}
                            onChange={(e) => setRequestPhone(e.target.value)}
                            className="pl-10 bg-stone-800 border-stone-600 text-white placeholder:text-stone-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-tier" className="text-stone-300">Access Level</Label>
                        <Select value={requestTier} onValueChange={(v) => setRequestTier(v as AccessTier)}>
                          <SelectTrigger className="bg-stone-800 border-stone-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-800 border-stone-600">
                            <SelectItem value="TEASER">
                              <div>
                                <div className="font-medium">Teaser</div>
                                <div className="text-xs text-stone-400">Public materials</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="QUALIFIED">
                              <div>
                                <div className="font-medium">Qualified</div>
                                <div className="text-xs text-stone-400">NDA required</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="TRANSACTION">
                              <div>
                                <div className="font-medium">Transaction</div>
                                <div className="text-xs text-stone-400">Deal-specific</div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="req-message" className="text-stone-300">Message</Label>
                      <Textarea
                        id="req-message"
                        placeholder="Tell us about your interest in Aurora OSI..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        className="bg-stone-800 border-stone-600 text-white placeholder:text-stone-500 min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={requestLoading}
                    >
                      {requestLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-xs text-stone-500">
          <p>© 2026 Aurora OSI. All rights reserved.</p>
          <p className="mt-1">Contact: <a href="mailto:data-room@aurora-osi.com" className="text-amber-500 hover:underline">data-room@aurora-osi.com</a></p>
        </div>
      </div>
    </div>
  )
}

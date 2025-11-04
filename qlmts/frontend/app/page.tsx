'use client'

import { AuthProvider, useAuth } from '../lib/auth'
import LoginForm from '../components/LoginForm'
import Dashboard from '../components/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
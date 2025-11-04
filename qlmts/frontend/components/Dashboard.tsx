'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth'
import Navigation from './Navigation'
import MaterialsPage from './pages/MaterialsPage'
import SamplesPage from './pages/SamplesPage'
import ReportsPage from './pages/ReportsPage'
import SuppliersPage from './pages/SuppliersPage'

function DashboardHome() {
  const { user } = useAuth()

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>
          Here's what's happening in your laboratory today
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {/* Stats Cards */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, marginRight: '16px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <dt style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Materials</dt>
              <dd style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>2</dd>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, marginRight: '16px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <dt style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Active Samples</dt>
              <dd style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>1</dd>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, marginRight: '16px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <dt style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Tests Completed</dt>
              <dd style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>2</dd>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, marginRight: '16px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <dt style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Reports Generated</dt>
              <dd style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>1</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%' 
              }}></div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827' }}>Heat record HT-2024-001234 created</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>2 hours ago</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%' 
              }}></div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827' }}>Sample S-2024-000001 registered</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>3 hours ago</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '50%' 
              }}></div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827' }}>Chemical test completed</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>4 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />
      case 'materials':
        return <MaterialsPage />
      case 'samples':
        return <SamplesPage />
      case 'reports':
        return <ReportsPage />
      case 'suppliers':
        return <SuppliersPage />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main style={{ 
        marginLeft: '256px', 
        paddingTop: '64px',
        transition: 'margin-left 0.3s ease'
      }}>
        {renderPage()}
      </main>
    </div>
  )
}
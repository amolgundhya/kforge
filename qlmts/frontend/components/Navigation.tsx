'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
    },
    {
      id: 'materials',
      name: 'Materials & Heat',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'samples',
      name: 'Samples & Testing',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'suppliers',
      name: 'Suppliers',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: '64px'
      }}>
        <div style={{ 
          height: '100%',
          paddingLeft: isSidebarOpen ? '256px' : '80px',
          paddingRight: '24px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          transition: 'padding-left 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '8px',
                marginRight: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              {menuItems.find(item => item.id === currentPage)?.name || 'QLMTS'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: '#374151' }}>
              <span style={{ fontWeight: '500' }}>{user?.name}</span>
              <span style={{ 
                marginLeft: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                borderRadius: '4px'
              }}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isSidebarOpen ? '256px' : '80px',
        backgroundColor: '#1f2937',
        transition: 'width 0.3s ease',
        zIndex: 40,
        paddingTop: '64px'
      }}>
        <div style={{ padding: '24px 0' }}>
          {/* Logo */}
          <div style={{ 
            padding: isSidebarOpen ? '0 24px 24px 24px' : '0 0 24px 0',
            textAlign: isSidebarOpen ? 'left' : 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: isSidebarOpen ? '12px' : '0'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {isSidebarOpen && (
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>QLMTS</span>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  marginBottom: '4px',
                  backgroundColor: currentPage === item.id ? '#374151' : 'transparent',
                  color: currentPage === item.id ? '#3b82f6' : '#d1d5db',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                }}
                onMouseOver={(e) => {
                  if (currentPage !== item.id) {
                    e.target.style.backgroundColor = '#374151'
                    e.target.style.color = '#f9fafb'
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== item.id) {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#d1d5db'
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {item.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
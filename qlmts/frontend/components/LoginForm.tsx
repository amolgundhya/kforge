'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const success = await login(email, password)
    
    if (!success) {
      setError('Invalid email or password')
    }
    
    setIsLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '48px 16px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Sign in to QLMTS
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Quality Lab & Material Traceability System
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#b91c1c' }}>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ marginTop: '24px' }}>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                Test Credentials:
              </h3>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Admin:</strong> admin@qlmts.com / Admin@123
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>QC Manager:</strong> qc.manager@qlmts.com / QCManager@123
                </div>
                <div>
                  <strong>Lab Tech:</strong> lab.tech@qlmts.com / LabTech@123
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
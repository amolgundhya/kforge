'use client'

import { useState, useEffect } from 'react'

interface Sample {
  id: string
  code: string
  sourceType: string
  sourceId: string
  priority: string
  state: string
  requestedBy: string
  notes?: string
  createdAt: string
  registeredAt?: string
  heat?: {
    heatNo: string
    materialGrade: string
  }
  tests: Test[]
}

interface Test {
  id: string
  category: string
  method: string
  standard?: string
  status: string
  startedAt?: string
  completedAt?: string
  results: TestResult[]
}

interface TestResult {
  id: string
  parameter: string
  value: number
  unit: string
  verdict: string
}

interface Heat {
  id: string
  heatNo: string
  materialGrade: string
}

interface SampleFormData {
  sourceType: string
  sourceId: string
  priority: string
  requestedBy: string
  notes: string
}

const SOURCE_TYPES = ['HEAT', 'PRODUCT', 'BATCH'] as const
const PRIORITIES = ['HIGH', 'NORMAL', 'LOW'] as const

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [heats, setHeats] = useState<Heat[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<SampleFormData>({
    sourceType: 'HEAT',
    sourceId: '',
    priority: 'NORMAL',
    requestedBy: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<SampleFormData>>({})

  useEffect(() => {
    fetchSamples()
    fetchHeats()
  }, [])

  const fetchSamples = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch('http://localhost:4000/api/samples', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSamples(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching samples:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHeats = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch('http://localhost:4000/api/materials/heats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setHeats(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching heats:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SampleFormData> = {}
    
    if (!formData.sourceId) {
      newErrors.sourceId = 'Source material is required'
    }
    
    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Requested by is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const url = showEditForm 
        ? `http://localhost:4000/api/samples/${selectedSample?.id}`
        : 'http://localhost:4000/api/samples'
      
      const method = showEditForm ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        notes: formData.notes || undefined
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        await fetchSamples()
        resetForm()
        setShowCreateForm(false)
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        console.error('Error saving sample:', errorData)
      }
    } catch (error) {
      console.error('Error saving sample:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (sample: Sample) => {
    setSelectedSample(sample)
    setFormData({
      sourceType: sample.sourceType,
      sourceId: sample.sourceId,
      priority: sample.priority,
      requestedBy: sample.requestedBy,
      notes: sample.notes || ''
    })
    setErrors({})
    setShowEditForm(true)
  }

  const handleDelete = async (sample: Sample) => {
    if (!confirm(`Are you sure you want to delete sample ${sample.code}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/samples/${sample.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchSamples()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete sample')
      }
    } catch (error) {
      console.error('Error deleting sample:', error)
      alert('Failed to delete sample')
    }
  }

  const handleRegister = async (sample: Sample) => {
    if (!confirm(`Are you sure you want to register sample ${sample.code}?`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/samples/${sample.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchSamples()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to register sample')
      }
    } catch (error) {
      console.error('Error registering sample:', error)
      alert('Failed to register sample')
    }
  }

  const handleView = (sample: Sample) => {
    setSelectedSample(sample)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setFormData({
      sourceType: 'HEAT',
      sourceId: '',
      priority: 'NORMAL',
      requestedBy: '',
      notes: ''
    })
    setErrors({})
    setSelectedSample(null)
  }

  const handleInputChange = (field: keyof SampleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return { bg: '#dcfce7', color: '#166534' }
      case 'registered': return { bg: '#dbeafe', color: '#1e40af' }
      case 'in_progress': return { bg: '#fef3c7', color: '#92400e' }
      case 'pending': return { bg: '#f3f4f6', color: '#6b7280' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return { bg: '#fecaca', color: '#b91c1c' }
      case 'normal': return { bg: '#dbeafe', color: '#1e40af' }
      case 'low': return { bg: '#f3f4f6', color: '#6b7280' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  const tabs = [
    { id: 'all', name: 'All Samples', count: samples.length },
    { id: 'pending', name: 'Pending', count: samples.filter(s => s.state === 'PENDING').length },
    { id: 'registered', name: 'Registered', count: samples.filter(s => s.state === 'REGISTERED').length },
    { id: 'in_progress', name: 'In Testing', count: samples.filter(s => s.state === 'IN_PROGRESS').length },
    { id: 'completed', name: 'Completed', count: samples.filter(s => s.state === 'COMPLETED').length }
  ]

  const filteredSamples = samples.filter(sample => {
    if (activeTab === 'all') return true
    return sample.state.toLowerCase() === activeTab.toLowerCase()
  })

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading samples...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Samples & Testing
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Manage sample registration, test execution, and result validation
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Sample
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          display: 'inline-flex',
          gap: '4px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.name}
              <span style={{
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '12px',
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                color: activeTab === tab.id ? 'white' : '#6b7280'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Samples Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {filteredSamples.map((sample) => (
          <div
            key={sample.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => handleView(sample)}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {sample.code}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  {sample.heat?.heatNo} - {sample.heat?.materialGrade}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  ...getStatusColor(sample.state)
                }}>
                  {sample.state}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  ...getPriorityColor(sample.priority)
                }}>
                  {sample.priority}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                <strong>Requested by:</strong> {sample.requestedBy}
              </p>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                <strong>Registered:</strong> {sample.registeredAt ? new Date(sample.registeredAt).toLocaleDateString() : 'Not yet'}
              </p>
            </div>

            {sample.notes && (
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic' }}>
                "{sample.notes}"
              </p>
            )}

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {sample.tests.length} Test{sample.tests.length !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sample.state === 'PENDING' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegister(sample)
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Register
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(sample)
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(sample)
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSamples.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>No samples found</p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Register your first sample to get started
          </p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
              {showEditForm ? 'Edit Sample' : 'Register New Sample'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {/* Source Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Source Type *
                  </label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => {
                      handleInputChange('sourceType', e.target.value)
                      handleInputChange('sourceId', '') // Reset source selection
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {SOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Source Material */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Source Material *
                  </label>
                  <select
                    value={formData.sourceId}
                    onChange={(e) => handleInputChange('sourceId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.sourceId ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select {formData.sourceType}</option>
                    {formData.sourceType === 'HEAT' && heats.map((heat) => (
                      <option key={heat.id} value={heat.id}>
                        {heat.heatNo} - {heat.materialGrade}
                      </option>
                    ))}
                  </select>
                  {errors.sourceId && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.sourceId}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                {/* Requested By */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Requested By *
                  </label>
                  <input
                    type="email"
                    value={formData.requestedBy}
                    onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                    placeholder="requester@company.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.requestedBy ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.requestedBy && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.requestedBy && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.requestedBy && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.requestedBy}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this sample..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setShowEditForm(false)
                    resetForm()
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submitting && (
                    <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  )}
                  {submitting ? 'Saving...' : (showEditForm ? 'Update Sample' : 'Register Sample')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSample && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                {selectedSample.code}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sample Details */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Sample Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Material</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    {selectedSample.heat?.heatNo} - {selectedSample.heat?.materialGrade}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Status</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getStatusColor(selectedSample.state)
                    }}>
                      {selectedSample.state}
                    </span>
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Priority</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getPriorityColor(selectedSample.priority)
                    }}>
                      {selectedSample.priority}
                    </span>
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Requested By</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSample.requestedBy}</p>
                </div>
              </div>
              {selectedSample.notes && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Notes</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSample.notes}</p>
                </div>
              )}
            </div>

            {/* Test Results */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Test Results</h3>
              {selectedSample.tests.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No tests have been performed yet.</p>
              ) : (
                selectedSample.tests.map((test) => (
                  <div key={test.id} style={{ marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {test.category} - {test.method}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        ...getStatusColor(test.status)
                      }}>
                        {test.status}
                      </span>
                    </div>
                    
                    {test.standard && (
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                        Standard: {test.standard}
                      </p>
                    )}

                    {test.results.length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Parameter</th>
                              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Unit</th>
                              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Verdict</th>
                            </tr>
                          </thead>
                          <tbody>
                            {test.results.map((result) => (
                              <tr key={result.id}>
                                <td style={{ padding: '8px 0', fontSize: '14px', color: '#111827' }}>{result.parameter}</td>
                                <td style={{ padding: '8px 0', fontSize: '14px', color: '#111827' }}>{result.value}</td>
                                <td style={{ padding: '8px 0', fontSize: '14px', color: '#111827' }}>{result.unit}</td>
                                <td style={{ padding: '8px 0' }}>
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    backgroundColor: result.verdict === 'PASS' ? '#dcfce7' : '#fecaca',
                                    color: result.verdict === 'PASS' ? '#166534' : '#b91c1c'
                                  }}>
                                    {result.verdict}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
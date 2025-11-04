'use client'

import { useState, useEffect } from 'react'

interface Report {
  id: string
  reportNo: string
  sampleId: string
  status: string
  fileUrl?: string
  version: number
  checksum?: string
  createdAt: string
  releasedAt?: string
  sample: {
    code: string
    state: string
    heat?: {
      heatNo: string
      materialGrade: string
      supplier: {
        name: string
        code: string
      }
    }
    tests?: Test[]
  }
}

interface Test {
  id: string
  category: string
  method: string
  standard?: string
  status: string
  results: TestResult[]
}

interface TestResult {
  id: string
  parameter: string
  value: number
  unit: string
  verdict: string
}

interface Sample {
  id: string
  code: string
  state: string
  heat?: {
    heatNo: string
    materialGrade: string
  }
  tests: Test[]
}

interface ReportFormData {
  sampleId: string
  notes: string
}

const REPORT_STATUSES = ['DRAFT', 'REVIEW', 'RELEASED', 'CANCELLED'] as const

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showMTCPreview, setShowMTCPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<ReportFormData>({
    sampleId: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<ReportFormData>>({})

  useEffect(() => {
    fetchReports()
    fetchSamples()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch('http://localhost:4000/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setReports(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSamples = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      // Fetch all samples and filter on frontend
      const response = await fetch('http://localhost:4000/api/samples', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Filter samples that have at least one completed test and are eligible for reports
        const eligibleSamples = (data.data || []).filter((sample: Sample) => 
          sample.tests && sample.tests.some(test => test.status === 'COMPLETED') &&
          (sample.state === 'REGISTERED' || sample.state === 'IN_PROGRESS' || sample.state === 'COMPLETED')
        )
        setSamples(eligibleSamples)
        console.log('Fetched eligible samples:', eligibleSamples)
      } else {
        console.error('Failed to fetch samples:', response.status)
      }
    } catch (error) {
      console.error('Error fetching samples:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportFormData> = {}
    
    if (!formData.sampleId) {
      newErrors.sampleId = 'Sample selection is required'
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
      
      const payload = {
        sampleId: formData.sampleId,
        notes: formData.notes || undefined
      }
      
      const response = await fetch('http://localhost:4000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        await fetchReports()
        resetForm()
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        console.error('Error creating report:', errorData)
        alert(errorData.message || 'Failed to create report')
      }
    } catch (error) {
      console.error('Error creating report:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateMTC = async (report: Report) => {
    if (!confirm(`Generate MTC for report ${report.reportNo}?`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/reports/${report.id}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        await fetchReports()
        setSelectedReport(data)
        setShowMTCPreview(true)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to generate MTC')
      }
    } catch (error) {
      console.error('Error generating MTC:', error)
      alert('Failed to generate MTC')
    }
  }

  const handleReleaseReport = async (report: Report) => {
    if (!confirm(`Are you sure you want to release report ${report.reportNo}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/reports/${report.id}/release`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchReports()
        alert(`Report ${report.reportNo} has been released successfully`)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to release report')
      }
    } catch (error) {
      console.error('Error releasing report:', error)
      alert('Failed to release report')
    }
  }

  const handleDownloadReport = async (report: Report) => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/reports/${report.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.reportNo}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    }
  }

  const handleDelete = async (report: Report) => {
    if (!confirm(`Are you sure you want to delete report ${report.reportNo}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/reports/${report.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchReports()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    }
  }

  const handleView = (report: Report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setFormData({
      sampleId: '',
      notes: ''
    })
    setErrors({})
    setSelectedReport(null)
  }

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return { bg: '#f3f4f6', color: '#6b7280' }
      case 'REVIEW': return { bg: '#fef3c7', color: '#92400e' }
      case 'RELEASED': return { bg: '#dcfce7', color: '#166534' }
      case 'CANCELLED': return { bg: '#fecaca', color: '#b91c1c' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  const getVerdictColor = (verdict: string) => {
    return verdict === 'PASS' 
      ? { bg: '#dcfce7', color: '#166534' }
      : { bg: '#fecaca', color: '#b91c1c' }
  }

  const tabs = [
    { id: 'all', name: 'All Reports', count: reports.length },
    { id: 'draft', name: 'Draft', count: reports.filter(r => r.status === 'DRAFT').length },
    { id: 'review', name: 'Under Review', count: reports.filter(r => r.status === 'REVIEW').length },
    { id: 'released', name: 'Released', count: reports.filter(r => r.status === 'RELEASED').length }
  ]

  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true
    if (activeTab === 'draft') return report.status === 'DRAFT'
    if (activeTab === 'review') return report.status === 'REVIEW'
    if (activeTab === 'released') return report.status === 'RELEASED'
    return true
  })

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading reports...</p>
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
            Reports & MTCs
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Generate and manage Mill Test Certificates and quality reports
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
          Create Report
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

      {/* Reports Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Report No</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Sample</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Material</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Supplier</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                  {report.reportNo}
                  {report.version > 1 && (
                    <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>
                      v{report.version}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{report.sample.code}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {report.sample.heat?.heatNo} - {report.sample.heat?.materialGrade}
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {report.sample.heat?.supplier.name}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getStatusColor(report.status)
                  }}>
                    {report.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleView(report)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                    {report.status === 'DRAFT' && (
                      <button
                        onClick={() => handleGenerateMTC(report)}
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
                        Generate
                      </button>
                    )}
                    {report.status === 'REVIEW' && (
                      <button
                        onClick={() => handleReleaseReport(report)}
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
                        Release
                      </button>
                    )}
                    {report.status === 'RELEASED' && (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Download
                      </button>
                    )}
                    {report.status !== 'RELEASED' && (
                      <button
                        onClick={() => handleDelete(report)}
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
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>No reports found</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Create your first report to get started
            </p>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
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
            width: '100%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
              Create New Report
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Select Sample *
                </label>
                <select
                  value={formData.sampleId}
                  onChange={(e) => handleInputChange('sampleId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.sampleId ? '2px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a sample with completed tests</option>
                  {samples.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.code} - {sample.heat?.heatNo} ({sample.heat?.materialGrade})
                    </option>
                  ))}
                </select>
                {errors.sampleId && (
                  <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.sampleId}</p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments..."
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
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
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
                  {submitting ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedReport && (
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                {selectedReport.reportNo}
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

            {/* Report Details */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Report Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Status</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getStatusColor(selectedReport.status)
                    }}>
                      {selectedReport.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Version</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedReport.version}</p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Created</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedReport.releasedAt && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Released</label>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                      {new Date(selectedReport.releasedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Material Information */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Material Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Heat No</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedReport.sample.heat?.heatNo}</p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Grade</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedReport.sample.heat?.materialGrade}</p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Supplier</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedReport.sample.heat?.supplier.name}</p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Sample Code</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedReport.sample.code}</p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            {selectedReport.sample.tests && selectedReport.sample.tests.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Test Results</h3>
                {selectedReport.sample.tests.map((test) => (
                  <div key={test.id} style={{ marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {test.category} - {test.method}
                      </h4>
                      {test.standard && (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          Standard: {test.standard}
                        </span>
                      )}
                    </div>
                    
                    {test.results.length > 0 && (
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
                                  ...getVerdictColor(result.verdict)
                                }}>
                                  {result.verdict}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MTC Preview Modal */}
      {showMTCPreview && selectedReport && (
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
                MTC Preview - {selectedReport.reportNo}
              </h2>
              <button
                onClick={() => setShowMTCPreview(false)}
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

            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                MTC has been generated with checksum: <code style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '4px', fontSize: '12px' }}>{selectedReport.checksum?.substring(0, 16)}...</code>
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                The report is now in <strong>REVIEW</strong> status. You can release it to finalize the MTC.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowMTCPreview(false)
                  fetchReports()
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
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleReleaseReport(selectedReport)
                  setShowMTCPreview(false)
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Release Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
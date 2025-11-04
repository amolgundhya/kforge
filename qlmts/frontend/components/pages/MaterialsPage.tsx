'use client'

import { useState, useEffect } from 'react'

interface Heat {
  id: string
  heatNo: string
  materialGrade: string
  quantity: number
  unit: string
  receivedOn: string
  poNumber?: string
  grnNumber?: string
  supplier: {
    id: string
    name: string
    code: string
  }
  samples: any[]
}

interface Supplier {
  id: string
  code: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
}

interface HeatFormData {
  heatNo: string
  supplierId: string
  materialGrade: string
  receivedOn: string
  quantity: string
  unit: string
  poNumber: string
  grnNumber: string
}

const UNITS = ['KG', 'MT', 'LBS', 'PCS'] as const

export default function MaterialsPage() {
  const [heats, setHeats] = useState<Heat[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedHeat, setSelectedHeat] = useState<Heat | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<HeatFormData>({
    heatNo: '',
    supplierId: '',
    materialGrade: '',
    receivedOn: '',
    quantity: '',
    unit: 'KG',
    poNumber: '',
    grnNumber: ''
  })
  const [errors, setErrors] = useState<Partial<HeatFormData>>({})

  useEffect(() => {
    fetchHeats()
    fetchSuppliers()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch('http://localhost:4000/api/materials/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<HeatFormData> = {}
    
    if (!formData.heatNo.trim()) {
      newErrors.heatNo = 'Heat number is required'
    } else if (!/^[A-Za-z0-9\-\/\.]+$/.test(formData.heatNo)) {
      newErrors.heatNo = 'Heat number can only contain letters, numbers, hyphens, slashes, and dots'
    }
    
    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required'
    }
    
    if (!formData.materialGrade.trim()) {
      newErrors.materialGrade = 'Material grade is required'
    }
    
    if (!formData.receivedOn) {
      newErrors.receivedOn = 'Received date is required'
    } else if (new Date(formData.receivedOn) > new Date()) {
      newErrors.receivedOn = 'Received date cannot be in the future'
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
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
        ? `http://localhost:4000/api/materials/heats/${selectedHeat?.id}`
        : 'http://localhost:4000/api/materials/heats'
      
      const method = showEditForm ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        heatNo: formData.heatNo.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        poNumber: formData.poNumber || undefined,
        grnNumber: formData.grnNumber || undefined
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
        await fetchHeats()
        resetForm()
        setShowCreateForm(false)
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        if (errorData.message?.includes('already exists')) {
          setErrors({ heatNo: 'Heat number already exists' })
        }
      }
    } catch (error) {
      console.error('Error saving heat:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (heat: Heat) => {
    setSelectedHeat(heat)
    setFormData({
      heatNo: heat.heatNo,
      supplierId: heat.supplier.id,
      materialGrade: heat.materialGrade,
      receivedOn: heat.receivedOn.split('T')[0],
      quantity: heat.quantity.toString(),
      unit: heat.unit,
      poNumber: heat.poNumber || '',
      grnNumber: heat.grnNumber || ''
    })
    setErrors({})
    setShowEditForm(true)
  }

  const handleDelete = async (heat: Heat) => {
    if (!confirm(`Are you sure you want to delete heat ${heat.heatNo}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/materials/heats/${heat.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchHeats()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete heat record')
      }
    } catch (error) {
      console.error('Error deleting heat:', error)
      alert('Failed to delete heat record')
    }
  }

  const handleView = (heat: Heat) => {
    setSelectedHeat(heat)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setFormData({
      heatNo: '',
      supplierId: '',
      materialGrade: '',
      receivedOn: '',
      quantity: '',
      unit: 'KG',
      poNumber: '',
      grnNumber: ''
    })
    setErrors({})
    setSelectedHeat(null)
  }

  const handleInputChange = (field: keyof HeatFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const filteredHeats = heats.filter(heat =>
    heat.heatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    heat.materialGrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    heat.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading materials...</p>
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
            Materials & Heat Management
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Manage heat records, material traceability, and supplier information
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
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Heat
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search by heat number, material grade, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <select
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            <option>All Units</option>
            <option>KG</option>
            <option>MT</option>
            <option>LBS</option>
            <option>PCS</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px 24px 0 24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Heat Records ({filteredHeats.length})
          </h2>
        </div>
        
        {filteredHeats.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>No heat records found</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first heat record'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Heat Number
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Material Grade
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Supplier
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Received Date
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Samples
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHeats.map((heat, index) => (
                  <tr key={heat.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {heat.heatNo}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {heat.materialGrade}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {heat.supplier.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {heat.supplier.code}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {heat.quantity.toLocaleString()} {heat.unit}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {new Date(heat.receivedOn).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: heat.samples.length > 0 ? '#dcfce7' : '#f3f4f6',
                        color: heat.samples.length > 0 ? '#166534' : '#6b7280'
                      }}>
                        {heat.samples.length} Sample{heat.samples.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleView(heat)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#374151',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(heat)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(heat)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
              {showEditForm ? 'Edit Heat Record' : 'Add New Heat Record'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* Heat Number */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Heat Number *
                  </label>
                  <input
                    type="text"
                    value={formData.heatNo}
                    onChange={(e) => handleInputChange('heatNo', e.target.value)}
                    placeholder="e.g., HT-2024-001234"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.heatNo ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.heatNo && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.heatNo && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.heatNo && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.heatNo}</p>
                  )}
                </div>

                {/* Supplier */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Supplier *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleInputChange('supplierId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.supplierId ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.supplierId}</p>
                  )}
                </div>

                {/* Material Grade */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Material Grade *
                  </label>
                  <input
                    type="text"
                    value={formData.materialGrade}
                    onChange={(e) => handleInputChange('materialGrade', e.target.value)}
                    placeholder="e.g., ASTM A105"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.materialGrade ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.materialGrade && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.materialGrade && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.materialGrade && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.materialGrade}</p>
                  )}
                </div>

                {/* Received Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Received Date *
                  </label>
                  <input
                    type="date"
                    value={formData.receivedOn}
                    onChange={(e) => handleInputChange('receivedOn', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.receivedOn ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {errors.receivedOn && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.receivedOn}</p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="999999.999"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="1500.5"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.quantity ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.quantity && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.quantity && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.quantity && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.quantity}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
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
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* PO Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={formData.poNumber}
                    onChange={(e) => handleInputChange('poNumber', e.target.value)}
                    placeholder="PO-2024-1001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* GRN Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    GRN Number
                  </label>
                  <input
                    type="text"
                    value={formData.grnNumber}
                    onChange={(e) => handleInputChange('grnNumber', e.target.value)}
                    placeholder="GRN-2024-5678"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
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
                  {submitting ? 'Saving...' : (showEditForm ? 'Update Heat' : 'Create Heat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedHeat && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Heat Record Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Heat Number</label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginTop: '4px' }}>{selectedHeat.heatNo}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Material Grade</label>
                <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.materialGrade}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Supplier</label>
                <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.supplier.name}</p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>({selectedHeat.supplier.code})</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Quantity</label>
                <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.quantity.toLocaleString()} {selectedHeat.unit}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Received Date</label>
                <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{new Date(selectedHeat.receivedOn).toLocaleDateString()}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Samples</label>
                <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.samples.length} Sample{selectedHeat.samples.length !== 1 ? 's' : ''}</p>
              </div>
              {selectedHeat.poNumber && (
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>PO Number</label>
                  <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.poNumber}</p>
                </div>
              )}
              {selectedHeat.grnNumber && (
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>GRN Number</label>
                  <p style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>{selectedHeat.grnNumber}</p>
                </div>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(selectedHeat)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Heat
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleDelete(selectedHeat)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Heat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
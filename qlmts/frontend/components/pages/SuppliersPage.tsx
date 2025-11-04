'use client'

import { useState, useEffect } from 'react'

interface Supplier {
  id: string
  code: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    heats: number
  }
}

interface SupplierFormData {
  code: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  isActive: boolean
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<SupplierFormData>({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Partial<SupplierFormData>>({})

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch('http://localhost:4000/api/suppliers', {
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
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {}
    
    if (!formData.code.trim()) {
      newErrors.code = 'Supplier code is required'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
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
        ? `http://localhost:4000/api/suppliers/${selectedSupplier?.id}`
        : 'http://localhost:4000/api/suppliers'
      
      const method = showEditForm ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        contactPerson: formData.contactPerson || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined
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
        await fetchSuppliers()
        resetForm()
        setShowCreateForm(false)
        setShowEditForm(false)
      } else {
        const errorData = await response.json()
        console.error('Error saving supplier:', errorData)
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      isActive: supplier.isActive
    })
    setErrors({})
    setShowEditForm(true)
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`Are you sure you want to delete supplier ${supplier.name}? This action cannot be undone.`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('qlmts_token')
      const response = await fetch(`http://localhost:4000/api/suppliers/${supplier.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        await fetchSuppliers()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete supplier')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Failed to delete supplier')
    }
  }

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      isActive: true
    })
    setErrors({})
    setSelectedSupplier(null)
  }

  const handleInputChange = (field: keyof SupplierFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? { bg: '#dcfce7', color: '#166534' }
      : { bg: '#fecaca', color: '#b91c1c' }
  }

  const tabs = [
    { id: 'all', name: 'All Suppliers', count: suppliers.length },
    { id: 'active', name: 'Active', count: suppliers.filter(s => s.isActive).length },
    { id: 'inactive', name: 'Inactive', count: suppliers.filter(s => !s.isActive).length }
  ]

  const filteredSuppliers = suppliers.filter(supplier => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return supplier.isActive
    if (activeTab === 'inactive') return !supplier.isActive
    return true
  })

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading suppliers...</p>
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
            Supplier Management
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Manage supplier information, contacts, and track material deliveries
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
          Add Supplier
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

      {/* Suppliers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => handleView(supplier)}
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
                  {supplier.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  {supplier.code}
                </p>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                ...getStatusColor(supplier.isActive)
              }}>
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              {supplier.contactPerson && (
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                  <strong>Contact:</strong> {supplier.contactPerson}
                </p>
              )}
              {supplier.email && (
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                  <strong>Email:</strong> {supplier.email}
                </p>
              )}
              {supplier.phone && (
                <p style={{ fontSize: '14px', color: '#374151' }}>
                  <strong>Phone:</strong> {supplier.phone}
                </p>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {supplier._count.heats} Heat Record{supplier._count.heats !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(supplier)
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
                      handleDelete(supplier)
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

      {filteredSuppliers.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>No suppliers found</p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Add your first supplier to get started
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
              {showEditForm ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* Supplier Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="SUP-001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.code ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.code && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.code && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.code && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.code}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ABC Steel Corporation"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.name ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.name && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.name && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.name && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="John Smith"
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

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@abcsteel.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.email ? '2px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => !errors.email && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.email && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.email && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1-555-123-4567"
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

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
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
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Industrial Ave, Steel City, ST 12345"
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
                  {submitting ? 'Saving...' : (showEditForm ? 'Update Supplier' : 'Add Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSupplier && (
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
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                {selectedSupplier.name}
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

            {/* Supplier Details */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Supplier Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Code</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier.code}</p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Status</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getStatusColor(selectedSupplier.isActive)
                    }}>
                      {selectedSupplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                {selectedSupplier.contactPerson && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Contact Person</label>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier.contactPerson}</p>
                  </div>
                )}
                {selectedSupplier.email && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Email</label>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier.email}</p>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Phone</label>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier.phone}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Heat Records</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier._count.heats}</p>
                </div>
              </div>
              {selectedSupplier.address && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>Address</label>
                  <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px' }}>{selectedSupplier.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Modal from '@/components/molecules/Modal'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { contactsService } from '@/services/api/contactsService'

const ContactForm = ({ isOpen, onClose, contact = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        status: contact.status || 'active',
        tags: contact.tags ? contact.tags.join(', ') : ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'active',
        tags: ''
      })
    }
    setErrors({})
  }, [contact, isOpen])

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const contactData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      
      if (contact) {
        await contactsService.update(contact.Id, contactData)
        toast.success('Contact updated successfully!')
      } else {
        await contactsService.create(contactData)
        toast.success('Contact created successfully!')
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error('Failed to save contact. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'Add New Contact'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter contact name"
          error={errors.name}
          required
        />
        
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          error={errors.email}
          required
        />
        
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          error={errors.phone}
        />
        
        <FormField
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter company name"
          error={errors.company}
        />
        
        <FormField
          type="select"
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
          required
        />
        
        <FormField
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Enter tags separated by commas"
          error={errors.tags}
        />
        
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {contact ? 'Update Contact' : 'Create Contact'}
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ContactForm
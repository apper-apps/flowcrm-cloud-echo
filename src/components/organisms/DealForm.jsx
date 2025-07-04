import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Modal from '@/components/molecules/Modal'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { dealsService } from '@/services/api/dealsService'
import { contactsService } from '@/services/api/contactsService'

const DealForm = ({ isOpen, onClose, deal = null, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'lead',
    contactId: '',
    probability: '50',
    expectedCloseDate: ''
  })
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value?.toString() || '',
        stage: deal.stage || 'lead',
        contactId: deal.contactId || '',
        probability: deal.probability?.toString() || '50',
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : ''
      })
    } else {
      setFormData({
        title: '',
        value: '',
        stage: 'lead',
        contactId: '',
        probability: '50',
        expectedCloseDate: ''
      })
    }
    setErrors({})
  }, [deal, isOpen])

  const loadContacts = async () => {
    try {
      const contactsData = await contactsService.getAll()
      setContacts(contactsData)
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast.error('Failed to load contacts')
    }
  }

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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.value.trim()) {
      newErrors.value = 'Deal value is required'
    } else if (isNaN(formData.value) || parseFloat(formData.value) < 0) {
      newErrors.value = 'Please enter a valid amount'
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required'
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
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null
      }
      
      if (deal) {
        await dealsService.update(deal.Id, dealData)
        toast.success('Deal updated successfully!')
      } else {
        await dealsService.create(dealData)
        toast.success('Deal created successfully!')
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving deal:', error)
      toast.error('Failed to save deal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stageOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ]

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} - ${contact.company || 'No Company'}`
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'Add New Deal'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Deal Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter deal title"
          error={errors.title}
          required
        />
        
        <FormField
          label="Deal Value"
          name="value"
          type="number"
          value={formData.value}
          onChange={handleChange}
          placeholder="0.00"
          error={errors.value}
          required
        />
        
        <FormField
          type="select"
          label="Contact"
          name="contactId"
          value={formData.contactId}
          onChange={handleChange}
          options={contactOptions}
          placeholder="Select a contact"
          error={errors.contactId}
          required
        />
        
        <FormField
          type="select"
          label="Stage"
          name="stage"
          value={formData.stage}
          onChange={handleChange}
          options={stageOptions}
          error={errors.stage}
          required
        />
        
        <FormField
          label="Probability (%)"
          name="probability"
          type="number"
          value={formData.probability}
          onChange={handleChange}
          placeholder="50"
          min="0"
          max="100"
          error={errors.probability}
        />
        
        <FormField
          label="Expected Close Date"
          name="expectedCloseDate"
          type="date"
          value={formData.expectedCloseDate}
          onChange={handleChange}
          error={errors.expectedCloseDate}
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
                {deal ? 'Update Deal' : 'Create Deal'}
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

export default DealForm
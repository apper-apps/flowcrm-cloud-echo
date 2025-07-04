import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Modal from '@/components/molecules/Modal'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { tasksService } from '@/services/api/tasksService'
import { contactsService } from '@/services/api/contactsService'
import { dealsService } from '@/services/api/dealsService'

const TaskForm = ({ isOpen, onClose, task = null, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    contactId: '',
    dealId: ''
  })
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadContacts()
      loadDeals()
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        contactId: task.contactId || '',
        dealId: task.dealId || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        contactId: '',
        dealId: ''
      })
    }
    setErrors({})
  }, [task, isOpen])

  const loadContacts = async () => {
    try {
      const contactsData = await contactsService.getAll()
      setContacts(contactsData)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadDeals = async () => {
    try {
      const dealsData = await dealsService.getAll()
      setDeals(dealsData)
    } catch (error) {
      console.error('Error loading deals:', error)
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
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
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
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate),
        contactId: formData.contactId || null,
        dealId: formData.dealId || null
      }
      
      if (task) {
        await tasksService.update(task.Id, taskData)
        toast.success('Task updated successfully!')
      } else {
        await tasksService.create(taskData)
        toast.success('Task created successfully!')
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ]

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.name} - ${contact.company || 'No Company'}`
  }))

  const dealOptions = deals.map(deal => ({
    value: deal.Id,
    label: deal.title
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          error={errors.title}
          required
        />
        
        <FormField
          type="textarea"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          error={errors.description}
        />
        
        <FormField
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            error={errors.priority}
            required
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
        </div>
        
        <FormField
          type="select"
          label="Contact"
          name="contactId"
          value={formData.contactId}
          onChange={handleChange}
          options={contactOptions}
          placeholder="Select a contact (optional)"
          error={errors.contactId}
        />
        
        <FormField
          type="select"
          label="Deal"
          name="dealId"
          value={formData.dealId}
          onChange={handleChange}
          options={dealOptions}
          placeholder="Select a deal (optional)"
          error={errors.dealId}
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
                {task ? 'Update Task' : 'Create Task'}
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

export default TaskForm
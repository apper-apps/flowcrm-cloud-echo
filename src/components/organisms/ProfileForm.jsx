import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Modal from '@/components/molecules/Modal'
import FormField from '@/components/molecules/FormField'

const ProfileForm = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || '',
        department: profile.department || ''
      })
    }
  }, [profile])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions = [
    { value: 'Sales Manager', label: 'Sales Manager' },
    { value: 'Sales Representative', label: 'Sales Representative' },
    { value: 'Account Manager', label: 'Account Manager' },
    { value: 'Marketing Manager', label: 'Marketing Manager' },
    { value: 'Customer Success Manager', label: 'Customer Success Manager' },
    { value: 'Admin', label: 'Admin' }
  ]

  const departmentOptions = [
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Customer Success', label: 'Customer Success' },
    { value: 'Operations', label: 'Operations' },
    { value: 'IT', label: 'IT' },
    { value: 'HR', label: 'HR' }
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Profile"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            error={errors.name}
            required
          >
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              error={!!errors.name}
            />
          </FormField>

          <FormField
            label="Email"
            error={errors.email}
            required
          >
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={!!errors.email}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Role"
            error={errors.role}
            required
          >
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              placeholder="Select your role"
              error={!!errors.role}
            />
          </FormField>

          <FormField
            label="Department"
            error={errors.department}
            required
          >
            <Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departmentOptions}
              placeholder="Select your department"
              error={!!errors.department}
            />
          </FormField>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProfileForm
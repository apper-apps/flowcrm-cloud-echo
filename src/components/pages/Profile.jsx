import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ProfileForm from '@/components/organisms/ProfileForm'
import { profileService } from '@/services/api/profileService'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await profileService.getProfile()
      setProfile(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleFormClose = () => {
    setIsEditing(false)
  }

  const handleFormSave = async (formData) => {
    try {
      const updatedProfile = await profileService.updateProfile(profile.Id, formData)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadProfile} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-text-primary">Profile</h1>
        <Button
          onClick={handleEdit}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Edit" size={16} />
          <span>Edit Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-text-primary">
                  {profile?.name}
                </h2>
                <p className="text-text-secondary">{profile?.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Full Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-text-primary">{profile?.name}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-text-primary">{profile?.email}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Role
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-text-primary">{profile?.role}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Department
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-text-primary">{profile?.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Form Modal */}
      {isEditing && (
        <ProfileForm
          profile={profile}
          onSave={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Profile
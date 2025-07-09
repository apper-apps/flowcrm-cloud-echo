import mockProfile from '@/services/mockData/profile.json'

let profileData = { ...mockProfile }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const profileService = {
  async getProfile() {
    await delay(300)
    return { ...profileData }
  },

  async updateProfile(id, updatedData) {
    await delay(500)
    
    if (id !== profileData.Id) {
      throw new Error('Profile not found')
    }

    // Update profile data
    profileData = {
      ...profileData,
      ...updatedData,
      Id: profileData.Id // Ensure Id is not changed
    }

    return { ...profileData }
  },

  async changePassword(id, currentPassword, newPassword) {
    await delay(400)
    
    if (id !== profileData.Id) {
      throw new Error('Profile not found')
    }

    // In a real app, you'd validate the current password
    // For now, we'll just simulate success
    return { success: true, message: 'Password changed successfully' }
  }
}
import activitiesData from '@/services/mockData/activities.json'

let activities = [...activitiesData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const activitiesService = {
  async getAll() {
    await delay(300)
    return [...activities]
  },

  async getById(id) {
    await delay(200)
    const activity = activities.find(a => a.Id === id)
    if (!activity) {
      throw new Error('Activity not found')
    }
    return { ...activity }
  },

  async create(activityData) {
    await delay(500)
    
    const maxId = activities.length > 0 ? Math.max(...activities.map(a => a.Id)) : 0
    const newActivity = {
      Id: maxId + 1,
      ...activityData,
      timestamp: new Date().toISOString()
    }
    
    activities.push(newActivity)
    return { ...newActivity }
  },

  async update(id, activityData) {
    await delay(400)
    
    const index = activities.findIndex(a => a.Id === id)
    if (index === -1) {
      throw new Error('Activity not found')
    }
    
    activities[index] = {
      ...activities[index],
      ...activityData,
      Id: id
    }
    
    return { ...activities[index] }
  },

  async delete(id) {
    await delay(300)
    
    const index = activities.findIndex(a => a.Id === id)
    if (index === -1) {
      throw new Error('Activity not found')
    }
    
    activities.splice(index, 1)
    return true
  }
}
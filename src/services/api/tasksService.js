import tasksData from '@/services/mockData/tasks.json'

let tasks = [...tasksData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const tasksService = {
  async getAll() {
    await delay(300)
    return [...tasks]
  },

  async getById(id) {
    await delay(200)
    const task = tasks.find(t => t.Id === id)
    if (!task) {
      throw new Error('Task not found')
    }
    return { ...task }
  },

  async create(taskData) {
    await delay(500)
    
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0
    const newTask = {
      Id: maxId + 1,
      ...taskData,
      createdAt: new Date().toISOString()
    }
    
    tasks.push(newTask)
    return { ...newTask }
  },

  async update(id, taskData) {
    await delay(400)
    
    const index = tasks.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      Id: id
    }
    
    return { ...tasks[index] }
  },

  async delete(id) {
    await delay(300)
    
    const index = tasks.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    tasks.splice(index, 1)
    return true
  }
}
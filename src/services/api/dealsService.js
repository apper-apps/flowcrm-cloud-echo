import dealsData from '@/services/mockData/deals.json'

let deals = [...dealsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const dealsService = {
  async getAll() {
    await delay(300)
    return [...deals]
  },

  async getById(id) {
    await delay(200)
    const deal = deals.find(d => d.Id === id)
    if (!deal) {
      throw new Error('Deal not found')
    }
    return { ...deal }
  },

  async create(dealData) {
    await delay(500)
    
    const maxId = deals.length > 0 ? Math.max(...deals.map(d => d.Id)) : 0
    const newDeal = {
      Id: maxId + 1,
      ...dealData,
      createdAt: new Date().toISOString()
    }
    
    deals.push(newDeal)
    return { ...newDeal }
  },

  async update(id, dealData) {
    await delay(400)
    
    const index = deals.findIndex(d => d.Id === id)
    if (index === -1) {
      throw new Error('Deal not found')
    }
    
    deals[index] = {
      ...deals[index],
      ...dealData,
      Id: id
    }
    
    return { ...deals[index] }
  },

  async delete(id) {
    await delay(300)
    
    const index = deals.findIndex(d => d.Id === id)
    if (index === -1) {
      throw new Error('Deal not found')
    }
    
    deals.splice(index, 1)
    return true
  }
}
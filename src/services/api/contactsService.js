import contactsData from '@/services/mockData/contacts.json'

let contacts = [...contactsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const contactsService = {
  async getAll() {
    await delay(300)
    return [...contacts]
  },

  async getById(id) {
    await delay(200)
    const contact = contacts.find(c => c.Id === id)
    if (!contact) {
      throw new Error('Contact not found')
    }
    return { ...contact }
  },

  async create(contactData) {
    await delay(500)
    
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.Id)) : 0
    const newContact = {
      Id: maxId + 1,
      ...contactData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
    
    contacts.push(newContact)
    return { ...newContact }
  },

  async update(id, contactData) {
    await delay(400)
    
    const index = contacts.findIndex(c => c.Id === id)
    if (index === -1) {
      throw new Error('Contact not found')
    }
    
    contacts[index] = {
      ...contacts[index],
      ...contactData,
      Id: id
    }
    
    return { ...contacts[index] }
  },

  async delete(id) {
    await delay(300)
    
    const index = contacts.findIndex(c => c.Id === id)
    if (index === -1) {
      throw new Error('Contact not found')
    }
    
    contacts.splice(index, 1)
    return true
  }
}
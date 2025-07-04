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
  },

  async bulkCreate(contactsData) {
    await delay(800)
    
    const results = {
      successful: [],
      failed: []
    }
    
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.Id)) : 0
    let currentId = maxId + 1
    
    contactsData.forEach((contactData, index) => {
      try {
        // Validate required fields
        if (!contactData.name || !contactData.email) {
          results.failed.push({
            row: index + 1,
            data: contactData,
            error: 'Name and email are required'
          })
          return
        }
        
        // Check for duplicate email
        const existingContact = contacts.find(c => c.email.toLowerCase() === contactData.email.toLowerCase())
        if (existingContact) {
          results.failed.push({
            row: index + 1,
            data: contactData,
            error: 'Email already exists'
          })
          return
        }
        
        const newContact = {
          Id: currentId++,
          ...contactData,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
        
        contacts.push(newContact)
        results.successful.push(newContact)
      } catch (error) {
        results.failed.push({
          row: index + 1,
          data: contactData,
          error: error.message
        })
      }
    })
    
    return results
  }
}
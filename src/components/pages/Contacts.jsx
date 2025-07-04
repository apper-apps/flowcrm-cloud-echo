import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import SearchBar from '@/components/molecules/SearchBar'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ContactForm from '@/components/organisms/ContactForm'
import ImportWizard from '@/components/organisms/ImportWizard'
import ExportModal from '@/components/organisms/ExportModal'
import { contactsService } from '@/services/api/contactsService'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [showImportWizard, setShowImportWizard] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await contactsService.getAll()
      setContacts(data)
    } catch (err) {
      console.error('Error loading contacts:', err)
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.delete(contactId)
        setContacts(contacts.filter(contact => contact.Id !== contactId))
        toast.success('Contact deleted successfully!')
      } catch (error) {
        console.error('Error deleting contact:', error)
        toast.error('Failed to delete contact')
      }
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingContact(null)
  }

  const handleFormSave = () => {
    loadContacts()
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'lead':
        return 'info'
      case 'prospect':
        return 'warning'
      case 'customer':
        return 'success'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <Loading type="table" />
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Contacts</h1>
<p className="text-text-secondary">Manage your customer relationships</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowImportWizard(true)}
            variant="outline"
            className="hover:border-primary hover:text-primary"
          >
            <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowExportModal(true)}
            variant="outline"
            className="hover:border-primary hover:text-primary"
          >
            <ApperIcon name="Download" className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'active', 'inactive', 'lead', 'prospect', 'customer'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Empty
          type="contacts"
          onAction={() => setShowForm(true)}
          title={searchTerm || statusFilter !== 'all' ? 'No contacts found' : undefined}
          description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : undefined}
          actionText={searchTerm || statusFilter !== 'all' ? 'Clear Filters' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.Id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{contact.name}</h3>
                    <p className="text-sm text-text-secondary">{contact.company}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(contact.status)}>
                  {contact.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-text-secondary">
                  <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                  {contact.email}
                </div>
                {contact.phone && (
                  <div className="flex items-center text-sm text-text-secondary">
                    <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </div>
                )}
              </div>
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Created {format(new Date(contact.createdAt), 'MMM d, yyyy')}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                    className="text-primary hover:text-primary"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact.Id)}
                    className="text-error hover:text-error"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Form Modal */}
<ContactForm
        isOpen={showForm}
        onClose={handleFormClose}
        contact={editingContact}
        onSave={handleFormSave}
      />
      
      {/* Import Wizard */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onComplete={handleFormSave}
      />
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        contacts={contacts}
      />
    </div>
  )
}

export default Contacts
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import Modal from '@/components/molecules/Modal'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'

const ExportModal = ({ isOpen, onClose, contacts }) => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportFields, setExportFields] = useState([
    'name', 'email', 'phone', 'company', 'status'
  ])
  const [isExporting, setIsExporting] = useState(false)

  const availableFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'company', label: 'Company' },
    { value: 'status', label: 'Status' },
    { value: 'tags', label: 'Tags' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'lastActivity', label: 'Last Activity' }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'excel', label: 'Excel (.xlsx)' }
  ]

  const handleFieldToggle = (field) => {
    setExportFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const prepareData = () => {
    return contacts.map(contact => {
      const row = {}
      exportFields.forEach(field => {
        if (field === 'tags' && contact.tags) {
          row[field] = contact.tags.join(', ')
        } else if (field === 'createdAt' || field === 'lastActivity') {
          row[field] = new Date(contact[field]).toLocaleDateString()
        } else {
          row[field] = contact[field] || ''
        }
      })
      return row
    })
  }

  const exportAsCSV = () => {
    const data = prepareData()
    
    if (data.length === 0) {
      toast.warning('No data to export')
      return
    }

    const headers = exportFields.map(field => 
      availableFields.find(f => f.value === field)?.label || field
    )
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        exportFields.map(field => `"${row[field] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `contacts_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportAsExcel = () => {
    const data = prepareData()
    
    if (data.length === 0) {
      toast.warning('No data to export')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (exportFormat === 'csv') {
        exportAsCSV()
      } else {
        exportAsExcel()
      }
      
      toast.success('Export completed successfully!')
      onClose()
    } catch (error) {
      toast.error('Export failed: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Contacts"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center">
          <ApperIcon name="Download" className="w-16 h-16 mx-auto text-primary mb-4" />
          <p className="text-text-secondary">
            Export your contact data in your preferred format
          </p>
        </div>

        {/* Export Format */}
        <div>
          <Select
            label="Export Format"
            options={formatOptions}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          />
        </div>

        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Select Fields to Export
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableFields.map(field => (
              <label key={field.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportFields.includes(field.value)}
                  onChange={() => handleFieldToggle(field.value)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-text-primary">{field.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">
                <strong>{contacts.length}</strong> contacts will be exported
              </p>
              <p className="text-sm text-text-secondary">
                {exportFields.length} fields selected
              </p>
            </div>
            <ApperIcon name="FileText" className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || exportFields.length === 0}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {isExporting ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportModal
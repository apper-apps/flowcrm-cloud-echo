import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Modal from '@/components/molecules/Modal'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import { contactsService } from '@/services/api/contactsService'

const ImportWizard = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [csvHeaders, setCsvHeaders] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [previewData, setPreviewData] = useState([])
  const [importResults, setImportResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const contactFields = [
    { value: 'name', label: 'Name *' },
    { value: 'email', label: 'Email *' },
    { value: 'phone', label: 'Phone' },
    { value: 'company', label: 'Company' },
    { value: 'status', label: 'Status' },
    { value: 'tags', label: 'Tags (comma-separated)' }
  ]

  const statusOptions = ['active', 'inactive', 'lead', 'prospect', 'customer']

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file must contain at least a header row and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setCsvHeaders(headers)
      setCsvData(data)
      setCurrentStep(2)
    }
    reader.readAsText(file)
  }

  const handleMappingChange = (csvColumn, contactField) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: contactField
    }))
  }

  const generatePreview = () => {
    if (!csvData.length || !Object.keys(columnMapping).length) return

    const mapped = csvData.slice(0, 5).map(row => {
      const mappedRow = {}
      Object.entries(columnMapping).forEach(([csvColumn, contactField]) => {
        if (contactField && row[csvColumn]) {
          if (contactField === 'tags' && row[csvColumn]) {
            mappedRow[contactField] = row[csvColumn].split(',').map(tag => tag.trim())
          } else if (contactField === 'status') {
            const status = row[csvColumn].toLowerCase()
            mappedRow[contactField] = statusOptions.includes(status) ? status : 'lead'
          } else {
            mappedRow[contactField] = row[csvColumn]
          }
        }
      })
      return mappedRow
    })

    setPreviewData(mapped)
    setCurrentStep(3)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    
    try {
      const mappedData = csvData.map(row => {
        const mappedRow = {}
        Object.entries(columnMapping).forEach(([csvColumn, contactField]) => {
          if (contactField && row[csvColumn]) {
            if (contactField === 'tags' && row[csvColumn]) {
              mappedRow[contactField] = row[csvColumn].split(',').map(tag => tag.trim())
            } else if (contactField === 'status') {
              const status = row[csvColumn].toLowerCase()
              mappedRow[contactField] = statusOptions.includes(status) ? status : 'lead'
            } else {
              mappedRow[contactField] = row[csvColumn]
            }
          }
        })
        return mappedRow
      })

      const results = await contactsService.bulkCreate(mappedData)
      setImportResults(results)
      setCurrentStep(4)
      
      if (results.successful.length > 0) {
        toast.success(`Successfully imported ${results.successful.length} contacts`)
        onComplete()
      }
      
      if (results.failed.length > 0) {
        toast.warning(`${results.failed.length} contacts failed to import`)
      }
    } catch (error) {
      toast.error('Import failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setCsvFile(null)
    setCsvData([])
    setCsvHeaders([])
    setColumnMapping({})
    setPreviewData([])
    setImportResults(null)
    setCurrentStep(1)
    onClose()
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ApperIcon name="Upload" className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Upload CSV File</h3>
        <p className="text-text-secondary">
          Select a CSV file containing your contact data. The first row should contain column headers.
        </p>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <ApperIcon name="FileUp" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-text-primary font-medium">Click to upload CSV file</p>
          <p className="text-text-secondary text-sm">or drag and drop</p>
        </label>
      </div>
      
      {csvFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <ApperIcon name="FileText" className="w-5 h-5 text-primary mr-2" />
            <span className="text-text-primary font-medium">{csvFile.name}</span>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ApperIcon name="ArrowLeftRight" className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Map Columns</h3>
        <p className="text-text-secondary">
          Match your CSV columns to contact fields. Name and Email are required.
        </p>
      </div>
      
      <div className="space-y-4">
        {csvHeaders.map((header, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                label="CSV Column"
                value={header}
                disabled
                className="opacity-75"
              />
            </div>
            <ApperIcon name="ArrowRight" className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <Select
                label="Contact Field"
                options={[
                  { value: '', label: 'Skip this column' },
                  ...contactFields
                ]}
                value={columnMapping[header] || ''}
                onChange={(e) => handleMappingChange(header, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={generatePreview}
          disabled={!Object.values(columnMapping).some(field => field === 'name') || 
                   !Object.values(columnMapping).some(field => field === 'email')}
        >
          Preview
          <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ApperIcon name="Eye" className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Preview Import</h3>
        <p className="text-text-secondary">
          Review the first 5 contacts that will be imported. Make sure the data looks correct.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((contact, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{contact.name || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{contact.email || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{contact.phone || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{contact.company || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{contact.status || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <ApperIcon name="Info" className="w-5 h-5 text-blue-500 mr-2" />
          <p className="text-blue-800">
            {csvData.length} contacts will be imported. Duplicates will be skipped.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(2)}
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleImport}
          disabled={isProcessing}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          {isProcessing ? (
            <>
              <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
              Import Contacts
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ApperIcon name="CheckCircle" className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Import Complete</h3>
        <p className="text-text-secondary">
          Your contact import has been processed.
        </p>
      </div>
      
      {importResults && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-800">
                <strong>{importResults.successful.length}</strong> contacts imported successfully
              </p>
            </div>
          </div>
          
          {importResults.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-800">
                  <strong>{importResults.failed.length}</strong> contacts failed to import
                </p>
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {importResults.failed.map((failure, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    Row {failure.row}: {failure.error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={handleClose}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          Done
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </Modal>
  )
}

export default ImportWizard
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import DealForm from '@/components/organisms/DealForm'
import DealPipeline from '@/components/organisms/DealPipeline'
import { dealsService } from '@/services/api/dealsService'

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [viewMode, setViewMode] = useState('pipeline') // 'pipeline' or 'list'

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await dealsService.getAll()
      setDeals(data)
    } catch (err) {
      console.error('Error loading deals:', err)
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await dealsService.delete(dealId)
        setDeals(deals.filter(deal => deal.Id !== dealId))
        toast.success('Deal deleted successfully!')
      } catch (error) {
        console.error('Error deleting deal:', error)
        toast.error('Failed to delete deal')
      }
    }
  }

  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDeal(null)
  }

  const handleFormSave = () => {
    loadDeals()
  }

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getStageStats = () => {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']
    return stages.map(stage => ({
      stage,
      count: deals.filter(deal => deal.stage === stage).length,
      value: deals.filter(deal => deal.stage === stage).reduce((sum, deal) => sum + deal.value, 0)
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return <Loading type="kanban" />
  }

  if (error) {
    return <Error message={error} onRetry={loadDeals} />
  }

  const stageStats = getStageStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Deals</h1>
          <p className="text-text-secondary">Track your sales pipeline</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'pipeline' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('pipeline')}
            >
              <ApperIcon name="Columns" className="w-4 h-4 mr-2" />
              Pipeline
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ApperIcon name="List" className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Deals</p>
              <p className="text-2xl font-bold text-text-primary">{deals.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Target" className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Value</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(getTotalValue())}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Won Deals</p>
              <p className="text-2xl font-bold text-text-primary">
                {deals.filter(deal => deal.stage === 'closed-won').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Trophy" className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Win Rate</p>
              <p className="text-2xl font-bold text-text-primary">
                {deals.length > 0 ? Math.round((deals.filter(deal => deal.stage === 'closed-won').length / deals.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Deals Content */}
      {deals.length === 0 ? (
        <Empty
          type="deals"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div>
          {viewMode === 'pipeline' ? (
            <DealPipeline
              deals={deals}
              onDealUpdate={loadDeals}
              onDealEdit={handleEdit}
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-text-primary">All Deals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Deal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Probability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Expected Close
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deals.map((deal) => (
                      <tr key={deal.Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">{deal.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-primary">{formatCurrency(deal.value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            deal.stage === 'closed-won' ? 'bg-green-100 text-green-800' :
                            deal.stage === 'closed-lost' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {deal.stage.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {deal.probability}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deal)}
                              className="text-primary hover:text-primary"
                            >
                              <ApperIcon name="Edit2" className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(deal.Id)}
                              className="text-error hover:text-error"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Deal Form Modal */}
      <DealForm
        isOpen={showForm}
        onClose={handleFormClose}
        deal={editingDeal}
        onSave={handleFormSave}
      />
    </div>
  )
}

export default Deals
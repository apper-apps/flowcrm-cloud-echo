import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import { dealsService } from '@/services/api/dealsService'
import { contactsService } from '@/services/api/contactsService'

const DealPipeline = ({ deals, onDealUpdate, onDealEdit }) => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const contactsData = await contactsService.getAll()
      setContacts(contactsData)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const stages = [
    { id: 'lead', title: 'Lead', color: 'bg-blue-50 border-blue-200' },
    { id: 'qualified', title: 'Qualified', color: 'bg-purple-50 border-purple-200' },
    { id: 'proposal', title: 'Proposal', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-50 border-orange-200' },
    { id: 'closed-won', title: 'Closed Won', color: 'bg-green-50 border-green-200' },
    { id: 'closed-lost', title: 'Closed Lost', color: 'bg-red-50 border-red-200' }
  ]

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage)
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : 'Unknown Contact'
  }

  const getStageColor = (stage) => {
    const stageConfig = stages.find(s => s.id === stage)
    return stageConfig ? stageConfig.color : 'bg-gray-50'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const dealId = parseInt(draggableId)
    const newStage = destination.droppableId

    setLoading(true)
    try {
      await dealsService.update(dealId, { stage: newStage })
      onDealUpdate()
      toast.success('Deal stage updated successfully!')
    } catch (error) {
      console.error('Error updating deal stage:', error)
      toast.error('Failed to update deal stage')
    } finally {
      setLoading(false)
    }
  }

  const DealCard = ({ deal, index }) => (
    <Draggable draggableId={deal.Id.toString()} index={index} isDragDisabled={loading}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 cursor-pointer transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
          }`}
          onClick={() => onDealEdit(deal)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-text-primary truncate">{deal.title}</h4>
            <ApperIcon name="GripVertical" className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          
          <p className="text-sm text-text-secondary mb-2">
            {getContactName(deal.contactId)}
          </p>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-text-primary">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant="default" className="text-xs">
              {deal.probability}%
            </Badge>
          </div>
          
          {deal.expectedCloseDate && (
            <p className="text-xs text-text-secondary">
              Expected: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
            </p>
          )}
        </Card>
      )}
    </Draggable>
  )

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id)
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
          
          return (
            <div key={stage.id} className={`rounded-lg border-2 ${stage.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">{stage.title}</h3>
                <Badge variant="default">{stageDeals.length}</Badge>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-text-secondary">Total Value</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatCurrency(stageValue)}
                </p>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-white bg-opacity-50 rounded-lg' : ''
                    }`}
                  >
                    {stageDeals.map((deal, index) => (
                      <DealCard key={deal.Id} deal={deal} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

export default DealPipeline
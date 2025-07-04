import React from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Empty = ({ 
  type = 'default', 
  onAction,
  actionText = "Get Started",
  title,
  description 
}) => {
  const getEmptyContent = () => {
    switch (type) {
      case 'contacts':
        return {
          icon: 'Users',
          title: title || 'No contacts yet',
          description: description || 'Start building your customer relationships by adding your first contact.',
          actionText: actionText || 'Add First Contact',
          gradient: 'from-blue-500 to-purple-600'
        }
      case 'deals':
        return {
          icon: 'Target',
          title: title || 'No deals in progress',
          description: description || 'Create your first deal to start tracking your sales pipeline.',
          actionText: actionText || 'Create First Deal',
          gradient: 'from-green-500 to-emerald-600'
        }
      case 'tasks':
        return {
          icon: 'CheckSquare',
          title: title || 'No tasks scheduled',
          description: description || 'Stay organized by creating your first task.',
          actionText: actionText || 'Add First Task',
          gradient: 'from-orange-500 to-red-600'
        }
      case 'activities':
        return {
          icon: 'Activity',
          title: title || 'No activities logged',
          description: description || 'Track your customer interactions by logging your first activity.',
          actionText: actionText || 'Log First Activity',
          gradient: 'from-purple-500 to-pink-600'
        }
      case 'search':
        return {
          icon: 'Search',
          title: title || 'No results found',
          description: description || 'Try adjusting your search criteria or filters.',
          actionText: actionText || 'Clear Filters',
          gradient: 'from-gray-500 to-gray-600'
        }
      default:
        return {
          icon: 'FileText',
          title: title || 'No data available',
          description: description || 'Get started by adding your first item.',
          actionText: actionText,
          gradient: 'from-primary to-secondary'
        }
    }
  }

  const { icon, title: emptyTitle, description: emptyDescription, actionText: emptyActionText, gradient } = getEmptyContent()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-sm">
      <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
        <ApperIcon name={icon} className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
        {emptyTitle}
      </h3>
      
      <p className="text-text-secondary text-center mb-8 max-w-md leading-relaxed">
        {emptyDescription}
      </p>
      
      {onAction && emptyActionText && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-accent to-emerald-500 hover:from-emerald-500 hover:to-accent transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {emptyActionText}
        </Button>
      )}
      
      <div className="mt-8 flex items-center space-x-8 text-text-muted">
        <div className="flex items-center">
          <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
          <span className="text-sm">Quick to set up</span>
        </div>
        <div className="flex items-center">
          <ApperIcon name="Shield" className="w-4 h-4 mr-2" />
          <span className="text-sm">Secure</span>
        </div>
        <div className="flex items-center">
          <ApperIcon name="Smartphone" className="w-4 h-4 mr-2" />
          <span className="text-sm">Mobile friendly</span>
        </div>
      </div>
    </div>
  )
}

export default Empty
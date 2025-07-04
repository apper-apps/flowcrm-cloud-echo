import React from 'react'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const ActivityTimeline = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return 'Phone'
      case 'email':
        return 'Mail'
      case 'meeting':
        return 'Calendar'
      case 'note':
        return 'FileText'
      case 'task':
        return 'CheckSquare'
      default:
        return 'Circle'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600'
      case 'email':
        return 'bg-purple-100 text-purple-600'
      case 'meeting':
        return 'bg-green-100 text-green-600'
      case 'note':
        return 'bg-gray-100 text-gray-600'
      case 'task':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <ApperIcon name="Activity" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-text-secondary">No activities recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.Id} className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            <ApperIcon name={getActivityIcon(activity.type)} className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="default" className={`activity-${activity.type}`}>
                {activity.type}
              </Badge>
              <span className="text-sm text-text-secondary">
                {format(new Date(activity.timestamp), 'MMM d, yyyy - h:mm a')}
              </span>
            </div>
            <p className="text-sm text-text-primary">{activity.description}</p>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-text-secondary">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityTimeline
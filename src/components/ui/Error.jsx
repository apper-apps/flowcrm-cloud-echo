import React from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Error = ({ message = "Something went wrong", onRetry, type = 'default' }) => {
  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'Wifi',
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection and try again.'
        }
      case 'server':
        return {
          icon: 'Server',
          title: 'Server Error',
          description: 'The server encountered an error. Please try again in a few moments.'
        }
      case 'notfound':
        return {
          icon: 'Search',
          title: 'Not Found',
          description: 'The requested resource could not be found.'
        }
      default:
        return {
          icon: 'AlertCircle',
          title: 'Error',
          description: message
        }
    }
  }

  const { icon, title, description } = getErrorContent()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-sm">
      <div className="w-16 h-16 bg-gradient-to-br from-error to-red-600 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-text-secondary text-center mb-6 max-w-md leading-relaxed">
        {description}
      </p>
      
      {onRetry && (
        <div className="flex space-x-3">
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-gray-300 hover:border-primary hover:text-primary transition-all duration-200"
          >
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>
      )}
    </div>
  )
}

export default Error
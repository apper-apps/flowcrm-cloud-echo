import React from 'react'
import { useLocation } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Header = ({ onMenuToggle }) => {
  const location = useLocation()
  
  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/':
        return 'Dashboard'
      case '/contacts':
        return 'Contacts'
      case '/deals':
        return 'Deals'
      case '/tasks':
        return 'Tasks'
      case '/activities':
        return 'Activities'
      default:
        return 'FlowCRM'
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <h1 className="text-xl font-display font-semibold text-text-primary">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
          >
            <ApperIcon name="Search" className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
          >
            <ApperIcon name="Bell" className="w-5 h-5" />
          </Button>
          
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
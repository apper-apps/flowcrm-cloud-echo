import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  
const navigation = [
    { name: 'Dashboard', to: '/', icon: 'BarChart3' },
    { name: 'Contacts', to: '/contacts', icon: 'Users' },
    { name: 'Deals', to: '/deals', icon: 'Target' },
    { name: 'Tasks', to: '/tasks', icon: 'CheckSquare' },
    { name: 'Activities', to: '/activities', icon: 'Activity' },
    { name: 'Profile', to: '/profile', icon: 'User' }
  ]

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.to
    
    return (
      <NavLink
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
          }`
        }
      >
        <ApperIcon 
          name={item.icon} 
          className={`mr-3 h-5 w-5 ${
            isActive ? 'text-white' : 'text-text-muted group-hover:text-text-primary'
          }`} 
        />
        {item.name}
      </NavLink>
    )
  }

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
            <ApperIcon name="Zap" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-text-primary">
            FlowCRM
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-accent to-emerald-500 text-white">
            <ApperIcon name="TrendingUp" className="w-5 h-5 mr-3" />
            <div>
              <p className="text-sm font-medium">Upgrade to Pro</p>
              <p className="text-xs opacity-90">Get advanced features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar
  const MobileSidebar = () => (
    <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      
      <motion.div
        initial={{ x: -240 }}
        animate={{ x: isOpen ? 0 : -240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Zap" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold text-text-primary">
              FlowCRM
            </h1>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-accent to-emerald-500 text-white">
            <ApperIcon name="TrendingUp" className="w-5 h-5 mr-3" />
            <div>
              <p className="text-sm font-medium">Upgrade to Pro</p>
              <p className="text-xs opacity-90">Get advanced features</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}

export default Sidebar
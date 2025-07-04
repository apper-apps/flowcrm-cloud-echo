import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) => {
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : ''
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-sm transition-all duration-200 ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const Card = React.forwardRef(({ children, className = '', hover = false, ...props }, ref) => {
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-105' : ''
  
  return (
    <motion.div
      ref={ref}
      className={`bg-surface rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export default Card
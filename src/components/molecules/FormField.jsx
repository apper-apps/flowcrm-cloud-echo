import React from 'react'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'

const FormField = ({ 
  type = 'input',
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  className = '',
  options = [],
  ...props 
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value)
    }
  }

  if (type === 'select') {
    return (
      <Select
        label={label}
        value={value}
        onChange={handleChange}
        options={options}
        error={error}
        required={required}
        className={className}
        {...props}
      />
    )
  }

  if (type === 'textarea') {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none ${
            error 
              ? 'border-error focus:ring-error focus:border-error' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  }

  return (
    <Input
      label={label}
      name={name}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      className={className}
      {...props}
    />
  )
}

export default FormField
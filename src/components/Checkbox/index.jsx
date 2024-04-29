import React from 'react'
import { useController } from 'react-hook-form'
import { Link } from 'react-router-dom'

const Checkbox = ({
  control,
  name,
  type,
  label,
  error,
  defaultValue = false,
  rules,
  required = false,
}) => {
  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  })

  return (
    <div>
      <label>
        <input
          type='checkbox'
          onChange={(e) => onChange(e.target.checked)}
          checked={value}
        />
        {type === 'termsConditions' ? (
          <span className='ml-2 text-[15px]'>
            I agree and understand the{' '}
            <Link
              to='/termsConditions'
              className='text-blue-500 underline'
              target='_blank'
            >
              terms & conditions
            </Link>
            <span className='text-red-500'>*</span>
          </span>
        ) : (
          <span className='ml-2 text-[15px]'>
            {label}
            {required && <span className='text-red-500'>*</span>}
          </span>
        )}
      </label>
      {error && (
        <div className='mt-[4px] text-[12px] text-[#D86161]'>
          {error.message}
        </div>
      )}
    </div>
  )
}

export default Checkbox

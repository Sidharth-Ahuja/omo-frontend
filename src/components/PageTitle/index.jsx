import React from 'react'

export const Header = ({ title }) => {
  return (
    <h1 className='mb-0 text-center text-[18px] font-medium leading-tight text-primary w-full'>
      {title}
    </h1>
  )
}

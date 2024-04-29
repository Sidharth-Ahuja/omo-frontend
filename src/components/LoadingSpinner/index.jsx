import React, { Fragment } from 'react'
import './index.css'
import { DarkMode } from '../../atom/Atom'
import { useRecoilState } from 'recoil'

const LoadingSpinner = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)
  return (
    <div className={' w-full h-[100vh] ' + (isDarkMode ? " bg-[#252525]" : "") }>
      <div className='spinner center'>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
        <div className='spinner-blade'></div>
      </div>
    </div>
  )
}

export default LoadingSpinner

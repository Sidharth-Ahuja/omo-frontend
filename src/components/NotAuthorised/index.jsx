import React from 'react'
import { Link } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'

const NotAuthorised = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);
  return (
    <div 
    className='flex flex-col justify-center min-h-[100vh] text-center items-center'
    style={isDarkMode ? {color:'white'} : {} }
    >
      <img
        src='https://cdn-icons-png.flaticon.com/512/4123/4123751.png'
        className='w-[80px] mb-[20px]'
      ></img>
      <div className='font-bold text-[21px] mb-[20px]'>
        Please sign in first!
      </div>
      <div className='mb-[20px]'>
        This section is only allowed for authorised users.
      </div>
      <Link to='/login' className='text-blue-500 font-bold'>
        Login
      </Link>
    </div>
  )
}

export default NotAuthorised

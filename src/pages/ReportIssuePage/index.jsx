import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotAuthorised from '../../components/NotAuthorised'
import FileUploader from './FileUploader'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'
import BackGround from "../../assets/img/DarkMode/Background.png"
import Back from "../../assets/img/DarkMode/Back.svg";
import { Header } from '../../components/PageTitle'

const ReportIssuePage = () => {
  const userAuthID = localStorage.getItem('userAuthID')
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);
  const navigate = useNavigate();

  return userAuthID ? (
    <div className={'p-5 lg:w-[40%] lg:mx-auto min-h-[100vh] ' + (isDarkMode ? "text-white" : "")}
      style={isDarkMode ? { background: `url(${BackGround})`, color: 'white', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' } : {}}
    >

      {
        isDarkMode ?
          <div className="flex items-center px-2 pt-3">
            <img src={Back} alt=""
              className='mb-4 text-center text-[18px] font-medium leading-tight text-primary cursor-pointer' onClick={() => navigate("/myaccount")}
            />
            <Header title={"REPORT ISSUE"} />
          </div>
          :
          <div className='flex items-center'>
            <Link to='/myaccount'>
              <div>
                <ArrowLeftCircleIcon className='w-7 h-7 bg text-gray-500 arrow-svg' />
              </div>
            </Link>
            <div className='text-center font-bold text-lg mb-7'>REPORT ISSUE</div>
          </div>
      }

      {/* <div className='text-center font-bold text-lg mb-7'>REPORT ISSUE</div> */}
      <div className='mb-5'>
        Please let us know if there is any issue you want to report, or any bug
        you observe. Thankyou.
      </div>
      <div>
        <FileUploader />
      </div>
    </div>
  ) : (
    <NotAuthorised />
  )
}

export default ReportIssuePage

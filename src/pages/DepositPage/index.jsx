import React, { useState, useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { BitcoinIcon } from '../../assets/icons'
import app from '../../config/firebase'
import { doc, getDoc, getFirestore, onSnapshot } from 'firebase/firestore'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Header } from '../../components/PageTitle'
import NotAuthorised from '../../components/NotAuthorised'
import { Tabs } from './Tabs'
import axios from '../../config/axios'
import { useRecoilState } from 'recoil'
import { DarkMode } from "../../atom/Atom"
import { useNavigate } from 'react-router-dom'
import Back from "../../assets/img/DarkMode/Back.svg";
import BackGround from "../../assets/img/DarkMode/Background.png"

export const InputBuyTokens = atom(0)
export const InputTokenBalance = atom(0)
export const InputBuyTokenMessage = atom(false)
export const InputAdminWallet = atom('Wallet Address is loading...')

const fireStore = getFirestore(app)

const DepositPage = () => {
  const [tokenBalance, setTokenBalance] = useState(0)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adminWallet, setAdminWallet] = useAtom(InputAdminWallet)
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)
  const navigate = useNavigate();

  const userAuthID = localStorage.getItem('userAuthID')

  const fetchData = async () => {
    const response = await axios.get('/getWallet/' + userAuthID)
    if (response.status === 404) {
      setAdminWallet('No Wallet Found')
    } else {
      setAdminWallet(response.data.address)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const userRef = userAuthID ? doc(fireStore, 'users', userAuthID) : null

    let unsubscribe = null

    if (userRef) {
      unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setTokenBalance(parseFloat(doc.data().tokenBalance))
          setBonusBalance(parseFloat(doc.data().bonusBalance))
        } else {
          console.log('No such document!')
        }
        setLoading(false)
      })
    }
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])


  return userAuthID ? (
    loading ? (
      <LoadingSpinner />
    ) : (
      <div className={'p-[16px] min-h-[100vh] flex flex-col sm:w-[600px] mx-auto ' + (isDarkMode && " text-white ")} style={isDarkMode ? { background: `url(${BackGround})`, color: 'white', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' } : {}}>
        {isDarkMode ?
          <Header title="DEPOSIT" />
          :
          <Header title="DEPOSIT" />
        }
        <div className='flex justify-center mb-3'>
          <div className={'flex w-fit border px-3 py-1 rounded-xl shadow-sm ' + (isDarkMode ? " golden bg-transparent " : "bg-white border border-gray-300 ")}>
            <div className={'flex font-medium text-[16px] py-[1px] text-gray-600 ' + (isDarkMode && "text-white")}>
              <span className='mr-2'>
                {(tokenBalance + bonusBalance) % 1 === 0
                  ? +tokenBalance + bonusBalance
                  : (tokenBalance + bonusBalance).toFixed(2)}
              </span>
              <BitcoinIcon className='my-1 w-[20px] h-[18px] text-yellow-500' />
            </div>
          </div>
        </div>
        <Tabs />
      </div>
    )
  ) : (
    <NotAuthorised />
  )
}

export default DepositPage

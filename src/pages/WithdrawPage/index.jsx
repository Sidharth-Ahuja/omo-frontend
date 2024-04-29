import React, { useState, useEffect } from 'react'
import { BitcoinIcon } from '../../assets/icons'
import app from '../../config/firebase'
import { getDoc, doc, getFirestore, onSnapshot } from 'firebase/firestore'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Header } from '../../components/PageTitle'
import NotAuthorised from '../../components/NotAuthorised'
import { Tabs } from './Tabs'
import { atom, useAtom } from 'jotai'
import { useRecoilState } from 'recoil'
import { DarkMode } from "../../atom/Atom"
import { useNavigate } from 'react-router-dom'
import Back from "../../assets/img/DarkMode/Back.svg";
import BackGround from "../../assets/img/DarkMode/Background.png"

const fireStore = getFirestore(app)
export const InputTokenBalance = atom(0)
export const InputPlatformFeePerc = atom(0)
export const InputDocsVerified = atom(false)

const WithdrawPage = () => {
  const [tokenBalance, setTokenBalance] = useAtom(InputTokenBalance)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [platformFee, setPlatformFee] = useAtom(InputPlatformFeePerc)
  const [docsVerified, setIsDocsVerified] = useAtom(InputDocsVerified)
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);

  const userAuthID = localStorage.getItem('userAuthID')

  const fetchPlatformFee = async () => {
    const docRef = doc(fireStore, 'public', 'settings')
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const data = docSnapshot.data()
      setPlatformFee(data.withdrawFeePercentage)
    }
  }

  const fetchVerifyStatus = async () => {
    const userRef = userAuthID ? doc(fireStore, 'users', userAuthID) : null
    const userSnap = await getDoc(userRef)
    console.log(userSnap.data())
    if (userSnap.exists()) {
      setIsDocsVerified(
        userSnap.data().IDProofApprove && userSnap.data().addressProofApprove
      )
      console.log(docsVerified)
    }
  }

  useEffect(() => {
    fetchPlatformFee()
    fetchVerifyStatus()
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
      <div
        className={'p-[16px] flex flex-col min-h-[100vh] sm:w-[600px] mx-auto ' + (isDarkMode && " text-white ")}
        style={isDarkMode ? { background: `url(${BackGround})`, color: 'white', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }
          :
          {}
        }
      >

        {isDarkMode ?
          <Header title="WITHDRAW" />
          :
          <Header title="WITHDRAW" />
        }
        <div className='flex justify-center mb-3'>
          <div className={'flex w-fit border px-3 py-1 rounded-xl shadow-sm ' + (isDarkMode ? " golden bg-transparent " : "bg-white border border-gray-300 ")}>
            <div className={'flex font-medium text-[16px] py-[1px] text-gray-600' + (isDarkMode && "text-white")}>
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

export default WithdrawPage

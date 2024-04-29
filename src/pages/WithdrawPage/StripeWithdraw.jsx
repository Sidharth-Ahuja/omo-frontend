import React, { useState, useEffect } from 'react'
import { InfoIcon, ExclamationIcon, BitcoinIcon } from '../../assets/icons'
import app from '../../config/firebase'
import {
  setDoc,
  getDoc,
  doc,
  updateDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'
import { useAtom } from 'jotai'
import { InputPlatformFeePerc } from '.'
import { generateRandomInvoiceId } from '../../utils/helpers/helper'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'
import RightDarkButton from '../../components/DarkModeButton/RightDarkButton'
const fireStore = getFirestore(app)

const StripeWithdraw = () => {
  const [amount, setAmount] = useState('')
  const [platformFeePercentage, setPlatformFeePercentage] =
    useAtom(InputPlatformFeePerc)
  const [platformFee, setPlatformFee] = useState(0)
  const [remainingAmt, setRemainingAmt] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)

  const userAuthID = localStorage.getItem('userAuthID')
  const userRef = userAuthID ? doc(fireStore, 'users', userAuthID) : null

  const fetchTokenBalance = async () => {
    setLoading(true)
    try {
      const userSnap = await getDoc(userRef)
      setTotalBalance(userSnap.data().tokenBalance)
      setRemainingAmt(userSnap.data().tokenBalance)
    } catch (e) {
      console.log(e, 'No doc exist!')
    }
    setLoading(false)
  }

  useEffect(() => {
    userAuthID && fetchTokenBalance()
  }, [])
  const handleOnChangeAmount = (input) => {
    if (isNaN(input)) {
      setError(true)
      setMessage('Please enter numeric value')
      setShowMessage(true)
    } else {
      setAmount(input)
      const remAmt = (
        totalBalance -
        (+input + (+input * platformFeePercentage) / 100)
      ).toFixed(2)
      if (remAmt >= 0) {
        setRemainingAmt(
          (
            totalBalance -
            (+input + (+input * platformFeePercentage) / 100)
          ).toFixed(2)
        )
        setShowMessage(false)
        setPlatformFee((input * platformFeePercentage) / 100)
      } else {
        setPlatformFee(0)
        setRemainingAmt(totalBalance)
        setMessage('Please enter valid withdraw value')
        setShowMessage(true)
      }
    }
  }

  const handleOnClickWithdraw = async () => {
    setWithdrawLoading(true)
    if (amount < 5) {
      setError(true)
      setMessage('Withdraw amount should be at least €5')
    } else if (remainingAmt < 0) {
      setError(true)
      setRemainingAmt(totalBalance)
      setMessage('Withdraw not possible')
    } else {
      setError(false)
      const transactionRef = doc(collection(userRef, 'transactions'))
      await updateDoc(userRef, { tokenBalance: remainingAmt })

      await setDoc(transactionRef, {
        amount: amount,
        type: 'withdraw',
        invoiceId: generateRandomInvoiceId(),
        time: serverTimestamp(),
      })
      setTotalBalance(remainingAmt)
      setMessage('Withdraw transaction successfull!')
    }

    setAmount('')
    setPlatformFee(0)
    setShowMessage(true)
    setWithdrawLoading(false)
  }

  const handleMaxClick = () => {
    setAmount(+totalBalance - (platformFeePercentage / 100) * totalBalance)
    setPlatformFee(+(platformFeePercentage / 100) * totalBalance)
    setRemainingAmt(
      +totalBalance - (platformFeePercentage / 100) * +totalBalance
    )
  }

  return (
    <div>
      <div>
        <div className='flex flex-col px-4 py-4'>
          <div className='flex justify-between pb-[40px]'>
            <div>Withdrawable amount</div>
            <div>€ {totalBalance}</div>
          </div>

          <div className='flex justify-between pb-[40px]'>
            <div className=''>
              <span>Withdraw Amount</span>
              <div className='flex'>
                <InfoIcon
                  width='14px'
                  height='14px'
                  fill='gray'
                  className='mt-[4px] mr-[6px]'
                />
                <span className='text-[14px] text-gray-600'>Minimum €5</span>
              </div>
            </div>
            <div className='flex mt-[5px]'>
              <span className='mt-[2px] mr-[10px]'>€</span>
              <input
                placeholder=''
                value={amount}
                onChange={(e) => handleOnChangeAmount(e.target.value)}
                className={' text-center h-[35px] px-[8px] w-[66px] border border-gray-400 rounded-l-[5px]  focus:outline-none focus:ring-[1px] ' + (isDarkMode ? " text-white golden bg-black" : "focus:ring-blue-500 focus:border-blue-500")}
              />
              <div
                className={'px-2 py-1 h-[35px] rounded-r-md cursor-pointer font-semibold text-white ' + (isDarkMode ? " golden bg-gray-400" : "bg-gray-400")}
                onClick={handleMaxClick}
              >
                Max
              </div>
            </div>
          </div>

          <div className='flex justify-between text-red-600 pb-[40px]'>
            <div className=''>- Platform Free ({platformFeePercentage}%)</div>
            <div> € {platformFee} </div>
          </div>

          <div className='flex justify-between pb-[40px]'>
            <div>Remaining Balance</div>
            <div>€{remainingAmt}</div>
          </div>
        </div>

        <div className='w-full flex justify-center pb-[40px]'>
          {
            isDarkMode ?
              <button onClick={handleOnClickWithdraw} className='w-[40%] rounded-full'>

                <RightDarkButton title={withdrawLoading ? "Loading..." : "Withdraw"} />
              </button>
              :
              <button
                className='w-[40%] bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full'
                onClick={handleOnClickWithdraw}
              >
                {withdrawLoading ? <span>Loading...</span> : <span>Wthdraw</span>}
              </button>
          }

        </div>
        {showMessage && (
          <div className=' flex justify-center mb-[10px]'>
            {error ? (
              <ExclamationIcon
                width='20px'
                height='20px'
                className='mt-[2px] mr-[6px] text-red-500'
              />
            ) : (
              <CheckBadgeIcon
                width='18px'
                height='18px'
                className='mt-[2px] mr-[6px] text-red-500'
              />
            )}
            <span className='text-red-500 text-[14px] font-semibold'>
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StripeWithdraw

import React, { useState, useEffect } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { BitcoinIcon } from '../../assets/icons'
import { InputDocsVerified, InputPlatformFeePerc, InputTokenBalance } from '.'
import { atom, useAtom } from 'jotai'
import Popup, {
  InputIsModalOpen,
  InputModalContent,
  InputModalHeader,
  InputModalType,
} from '../../components/Popup'
import axios from '../../config/axios'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'
import RightDarkButton from '../../components/DarkModeButton/RightDarkButton'

export const InputFromWithdrawPage = atom(false)
const userAuthID = localStorage.getItem('userAuthID')

const BitcoinWithdraw = () => {
  const [totalBalance, setTotalBalance] = useAtom(InputTokenBalance)
  const [BTCaddress, setBTCaddress] = useState('')
  const [amount, setAmount] = useState('')
  const [errorAddress, setErrorAddress] = useState(false)
  const [errorAmount, setErrorAmount] = useState(false)
  const [plaformFeePercentage] = useAtom(InputPlatformFeePerc)
  const [isVerified, setIsVerified] = useAtom(InputDocsVerified)
  const [modalOpen, setModalOpen] = useAtom(InputIsModalOpen)
  const [modalHeader, setModalHeader] = useAtom(InputModalHeader)
  const [modalContent, setModalContent] = useAtom(InputModalContent)
  const [modalType, setModalType] = useAtom(InputModalType)
  const [fromWithdrawPage, setFromWithdrawPage] = useAtom(InputFromWithdrawPage)
  const [btcprice, setBtcPrice] = useState()
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);


  console.log({
    "address": BTCaddress,
    "amount": amount
  })
  const getEuros = async () => {
    console.log(totalBalance);
    axios.get('/getEuro')
      .then(response => setBtcPrice(response.data.euroAmount))
      .catch(error => console.error(error))
  };
  console.log(btcprice)
  useEffect(() => {
    getEuros();
  }, []);

  const handleWithdrawBTC = async () => {
    if (!isVerified) {
      console.log(isVerified);
      console.log("withdraw");
      setModalOpen(true);
      setModalHeader("Verify Documents");
      setModalContent(
        "Please verify your documents before proceeding with the withdrawal process. Thank you."
      );
      setModalType("verifyDoc");
      setFromWithdrawPage(true);
    } else {
      try {
        const response = await axios.post("https://us-central1-omo-v1.cloudfunctions.net/omoAPI/withdraw", {
          id: userAuthID, // Replace with the user ID
          address: BTCaddress, // Replace with the withdrawal address
          amount: amount, // Replace with the withdrawal amount in Euros
        });

        console.log({ tx: response.data.tx });

        // Display success message to the user
        setModalOpen(true);
        setModalHeader("Withdraw Success");
        setModalContent("Bitcoin withdrawal successful.");
        setModalType("success");
        setFromWithdrawPage(true);
      } catch (error) {
        console.log({ error });
        // Display error message to the user
        setModalOpen(true);
        setModalHeader("Withdraw Error");
        setModalContent("Failed to withdraw Bitcoin.");
        setModalType("error");
        setFromWithdrawPage(true);
      }
    }
  }

  const handleEnable2fA = () => { }
  const handleMaxClick = () => {
    setAmount(totalBalance)
  }

  return (
    <div className='py-4 px-4'>
      <div className='mb-4'>
        <div className={'font-medium text-[15px] mb-2 flex ' + (isDarkMode ? "text-white" : "text-gray-700")}>
          <BitcoinIcon className='w-5 h-5 mr-[8px] mt-[1px] text-yellow-500' />
          BTC Address <span className='text-red-400'>*</span>{' '}
        </div>
        <input
          value={BTCaddress}
          type='text'
          placeholder='Enter BTC address'
          className={'block text-md h-[36px] w-full px-2 py-1 outline-none border  rounded-md focus:ring-blue-500  ' + (isDarkMode ? 'text-white golden bg-black' : 'text-gray-900 bg-[#E2E8F0] border-[#E2E8F0] focus:border-blue-500 ')}
          onChange={(e) => setBTCaddress(e.target.value)}
        />
        {errorAddress && (
          <div className='flex mt-[4px]'>
            <ExclamationCircleIcon className='w-4 text-red-400 mr-1' />
            <div className='text-sm font-medium text-red-400'>
              Enter valid BTC address
            </div>
          </div>
        )}
      </div>
      <div className='mb-7'>
        <div className='flex justify-between'>
          <div className={'font-medium text-[15px] mb-2 flex ' + (isDarkMode ? "text-white" : "text-gray-700")}>
            Amount <span className='text-red-400'>*</span>{' '}
          </div>
          <div className='text-sm font-medium'>€{btcprice}</div>
          {/* Conversion btc to euro */}
        </div>
        <div className='flex'>
          <input
            type='number'
            value={amount}
            placeholder='Enter amount'
            className={'block h-[36px] w-full px-2 py-1 rounded-l-md text-md focus:ring-blue-500 ' + (isDarkMode ? 'text-white golden border-right-none bg-black' : 'text-gray-900 bg-[#E2E8F0] border border-[#E2E8F0] focus:border-blue-500 ')}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div
            className={' px-4 py-1 rounded-r-md cursor-pointer font-semibold ' + (isDarkMode ? "bg-[#4E4E4E] border-l-none golden " : "text-white border bg-gray-400  ")}
            onClick={handleMaxClick}
          >
            Max
          </div>
        </div>
        {errorAmount && (
          <div className='flex mt-[4px]'>
            <ExclamationCircleIcon className='w-4 text-red-400 mr-1' />
            <div className='text-sm font-medium text-red-400'>
              The minimum value is 5
            </div>
          </div>
        )}
      </div>

      <div className='w-full flex items-center justify-center text-center cursor-pointer mb-3' onClick={handleWithdrawBTC}>
        {
          isDarkMode ?
            <button className='w-[40%]'>
              <RightDarkButton title={'Withdraw'} />
            </button>
            :
            <div className='border w-[40%] text-center py-2 px-4  bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600'>
              Withdraw
            </div>
        }

      </div>
      <div className='text-[14px] mb-5'>
        Your withdrawal will have {plaformFeePercentage}% substracted from your
        remaining balance to cover the platform and gas fees required to process
        the transaction.
        <span className='flex'>
          Minimum withdrawal is 0.00020000{' '}
          <BitcoinIcon className='mx-1 mt-[3px] w-4 h-4 text-yellow-500' />
        </span>
      </div>
      <Popup />
      <div className='mb-11'>
        <div className='text-center mb-2 text-[15px]'>
          Improve your account security with Two-factor Authentication
        </div>
        <div className='flex justify-center '>
          <div
            className='px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold cursor-pointer'
            onClick={handleEnable2fA}
          >
            Enable 2FA
          </div>
        </div>
      </div>
    </div>
  )
}

export default BitcoinWithdraw

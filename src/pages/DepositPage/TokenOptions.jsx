import { useAtom } from 'jotai'
import React, { useState } from 'react'
import { InputBuyTokenMessage, InputBuyTokens } from './StripeDeposit'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'

const tokens = [
  { value: 5 },
  { value: 10 },
  { value: 20 },
  { value: 50 },
  { value: 100 },
]

const TokenOptions = () => {
  const [token, setToken] = useAtom(InputBuyTokens)
  const [showMessage, setShowMessage] = useAtom(InputBuyTokenMessage)
  const [customInput, setCustomInput] = useState('')
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);

  const handleTokenClick = (index) => {
    setToken(tokens[index].value)
    const clickedToken = document.getElementById(`token-${index}`)
    clickedToken.setAttribute('style', 'border: 2px solid #21C55D;')

    const inputHtml = document.getElementById('custom-token')
    inputHtml.setAttribute('style', 'border: 1px solid rgb(209 213 219);')

    tokens.map((token, i) => {
      if (i !== index) {
        const tokenHtml = document.getElementById(`token-${i}`)
        tokenHtml.setAttribute('style', 'border: 1px solid rgb(209 213 219);')
      }
    })
    setShowMessage(false)
  }

  const handleInputClick = () => {
    const inputHtml = document.getElementById('custom-token')
    inputHtml.setAttribute('style', 'border: 2px solid #42C55E')

    setToken(+customInput)
    setShowMessage(false)

    tokens.map((token, i) => {
      const tokenHtml = document.getElementById(`token-${i}`)
      tokenHtml.setAttribute('style', 'border: 1px solid rgb(209 213 219);')
    })
  }

  const handleInputChange = (input) => {
    if (isNaN(input)) {
      console.log('Input is not a number')
    } else {
      setCustomInput(input)
      setToken(+input)
    }

    tokens.map((token, i) => {
      const tokenHtml = document.getElementById(`token-${i}`)
      tokenHtml.setAttribute('style',  `${isDarkMode ? 'border: 1px solid #F7931A;' : 'border: 1px solid rgb(209 213 219);'}`)
    })
  }

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex justify-around mb-[30px]'>
          {tokens.slice(0, 3).map((token, index) => {
            return (
              <div
                key={index}
                className={'cursor-pointer w-[85px] text-center text-[20px] border   py-[5px] rounded-[5px] ' + (isDarkMode ? "border-[#F7931A]" : "border-gray-300")}
                onClick={() => handleTokenClick(index)}
                id={`token-${index}`}
              >
                {token.value}
              </div>
            )
          })}
        </div>

        <div className='flex justify-around mb-[30px]'>
          {tokens.slice(3, 5).map((token, index) => {
            return (
              <div
                key={index}
                className={'cursor-pointer w-[85px] text-center text-[20px] border  py-[5px] rounded-[5px] ' + (isDarkMode ? "border-[#F7931A]" : "border-gray-300")}
                onClick={() => handleTokenClick(index + 3)}
                id={`token-${index + 3}`}
              >
                {token.value}
              </div>
            )
          })}
          <input
            id='custom-token'
            placeholder='custom'
            className={'cursor-pointer text-center text-[20px] w-[90px] py-[5px] border  rounded-[5px] focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-[0px] ' + (isDarkMode ? " bg-black border-[#F7931A]" : "border-gray-300")}
            value={customInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onClick={() => handleInputClick()}
          />
        </div>
      </div>
    </div>
  )
}

export default TokenOptions

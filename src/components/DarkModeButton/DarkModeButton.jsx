import React from 'react';
import ButtonMiddle from "../../assets/img/DarkMode/svg/Buttoncenter.svg";
import leftbutton from "../../assets/img/DarkMode/svg/leftbutton.svg";
import rightbutton from "../../assets/img/darkMode/svg/rightbutton.svg";

export default function DarkModeButton({ title }) {
  return (
    <div className="flex gap-0 items-center">
      <img src={leftbutton} alt="" className='' />
      <div className='relative'>
        <img src={ButtonMiddle} alt="" className='relative -left-[0.65rem]' />
        <p
          className='absolute top-0 pt-[0.15rem] left-0 pl-[15%] pr-[15%]  font-bold text-[#fff] '
        >
          {title}
        </p>
      </div>
      <img src={rightbutton} alt="" className='relative -left-[1.30rem]' />
    </div>
  )
}

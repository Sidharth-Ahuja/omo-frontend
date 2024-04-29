import React from 'react';
import left from "../../assets/img/DarkMode/svg/LoginLeft.svg";
import middle from "../../assets/img/DarkMode/svg/LoginMiddle.svg";
import right from "../../assets/img/DarkMode/svg/LoginRight.svg";

function DarkLoginButton({ title, isRestore = false }) {
    return (
        <div className=' flex items-center'>
            <img src={left} alt="" className=' relative' />
            <div className='relative -left-[1.3rem]'>
                <img src={middle} alt="" className=' ' />
                <span
                    className={'absolute top-[17%]  text-white font-[700] text-[1.125rem] ' + (isRestore ? "left-[15%]" : "left-[35%]") }
                >
                    {title}
                </span>
            </div>
            <img src={right} alt="" className=' relative -left-10' />
        </div>
    )
}

export default DarkLoginButton

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useObject } from 'react-firebase-hooks/database';
import { useAtom } from 'jotai'
import {
  LockClosedIcon,
  UserIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/solid'
import {
  InputFromLivePage,
  InputStar1Lock,
  InputStar2Lock,
  InputStar3Lock,
  InputTokenBalance,
  InputTotalBalance,
  InputIsSpectator,
  InputTableAmount,
  InputTableLockChoice,
} from '.'
import app from '../../config/firebase'
import { useList } from 'react-firebase-hooks/database'
import { ref, set, get, getDatabase, onValue } from 'firebase/database'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'

const database = getDatabase(app)

const Table = ({
  index,
  starNum,
  tableNum,
  tableAmount,
  tableTime,
  lockTime,
  minimumLimit,
}) => {
  const [star1lock] = useAtom(InputStar1Lock)
  const [star2lock] = useAtom(InputStar2Lock)
  const [star3lock] = useAtom(InputStar3Lock)
  const [fromLivePage, setFromLivePage] = useAtom(InputFromLivePage)
  const [currentLock, setCurrentLock] = useState(false)
  const [tokenBalance] = useAtom(InputTokenBalance)
  const [totalBalance] = useAtom(InputTotalBalance)
  const [isSpectator, setIsSpectator] = useAtom(InputIsSpectator)
  const [tableAmountMain, setTableAmountMain] = useAtom(InputTableAmount)
  const [tableLockChoice, setTableLockChoice] = useAtom(InputTableLockChoice)
  const [liveUserCount, setLiveUserCount] = useState(0)

  const [bots, setBots] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);

  const [snapshotsTable, loadingTable1, error1] = useList(
    ref(database, `users/table${tableNum}/players`)
  )

  const paths = {
    minBots: `users/table${tableNum}/minBots`,
    maxBots: `users/table${tableNum}/maxBots`,
    totalCycleTime: `users/totalCycleTime`,
    botUpdateTime: `users/botUpdateTime`,
  };

  const [minBotsSnapshot] = useObject(ref(database, paths.minBots));
  const [maxBotsSnapshot] = useObject(ref(database, paths.maxBots));
  const [totalCycleTimeSnapshot] = useObject(ref(database, paths.totalCycleTime));
  const [botUpdateTimeSnapshot] = useObject(ref(database, paths.botUpdateTime));

  const minBots = minBotsSnapshot?.val() ?? 0;
  const maxBots = maxBotsSnapshot?.val() ?? 0;
  const totalCycleTime = totalCycleTimeSnapshot?.val() ?? 24; // Default 24 hour
  const botUpdateTime = botUpdateTimeSnapshot?.val() ?? 60; // Default 60 seconds
  
  useEffect(() => {
    // Stop if loading or invalid data
    if (loading || minBots == null || maxBots == null || totalCycleTime == null || botUpdateTime == null) return;

    const timePeriod = totalCycleTime * 60 * 60 * 1000; // Convert hours to milliseconds

    const updateBots = () => {
      const fraction = ((Date.now()) % timePeriod) / timePeriod;
      let currentBots;

      // Calculate bots based on the cycle phase
      if (fraction < 0.5) {
        currentBots = minBots + (maxBots - minBots) * (fraction * 2);
      } else {
        currentBots = maxBots - (maxBots - minBots) * ((fraction - 0.5) * 2);
      }

      // Apply randomness and enforce bounds
      const randomness = Math.floor(((Date.now() / 15000) + tableNum) % 7) - 3; // Randomness within [-3, 3]
      currentBots = Math.min(
        Math.max(Math.round(currentBots + randomness), minBots),
        maxBots
      );
      setBots(currentBots);
    };

    // Initial call and interval setup
    updateBots();
    intervalRef.current = setInterval(updateBots, botUpdateTime * 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalRef.current);
  }, [loading, minBots, maxBots, totalCycleTime, botUpdateTime]);

  // Monitor loading state
  useEffect(() => {
    if (minBots!=null && maxBots!=null && totalCycleTime!=null && botUpdateTime!=null) {
      setLoading(false);
    }
  }, [minBots, maxBots, totalCycleTime, botUpdateTime]);

  // console.log("snapshotsTable", snapshotsTable.docs);
  const findUniqueSnapshots = (snapshots) => {
    var uniqueSnapshots = snapshots?.filter(
      (snapshots, index, self) =>
        index === self.findIndex((t) => t.key === snapshots.key)
    )
    return uniqueSnapshots
  }

  function getServerTime() {
    return Math.floor(Date.now() / 1000)
  }

  const handleJoinClick = () => {
    // const timerRef = ref(getDatabase(), `users/table${tableNum}/timer`)
    // snapshotsTable.length === 0 && set(timerRef, +getServerTime() + tableTime)
    const timerRef = ref(database, `timer${tableNum}`)
    get(timerRef).then((snapshot) => {
      const initialTime = snapshot.val()
      if (initialTime <= lockTime) {
        setIsSpectator(true)
        setTableLockChoice(true)
      } else {
        setIsSpectator(false)
        setTableLockChoice(false)
      }
    })
    setTableAmountMain(tableAmount)
    const userAuthID = localStorage.getItem('userAuthID')
    set(
      ref(database, 'users/' + `table${tableNum}/` + 'players/' + userAuthID),
      {
        boxClicked: 0,
      }
    )
    setFromLivePage(true)
    navigate(`/${tableTime}/table/${tableNum}`)
  }

  useEffect(() => {
    starNum === 1
      ? setCurrentLock(star1lock)
      : starNum === 2
        ? setCurrentLock(star2lock)
        : starNum === 3 && setCurrentLock(star3lock)
  }, [star1lock, star2lock, star3lock])

  const [showRandom, setShowRandom] = useState(false);
  const [randomNum, setRandomNum] = useState(false);
  function showRandomNumber() {
    setShowRandom(true);
    const min = 3;

    const max = findUniqueSnapshots(snapshotsTable)?.length;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    // console.log(randomNumber);
    setRandomNum(randomNumber);
  }

  // Set the time interval in milliseconds (e.g., every 20 seconds)
  const intervalTime = 50000;

  // // Set the minimum and maximum values
  // const minNumber = 1;
  // const maxNumber = 100;

  // Use setInterval to call the function at regular intervals
  const intervalId = setInterval(() => {
    showRandomNumber();
  }, intervalTime);

  // Optionally, you can clear the interval after a certain number of repetitions
  const numberOfRepetitions = 10; // Change this to the desired number of repetitions
  setTimeout(() => {
    clearInterval(intervalId);
    console.log('Interval stopped after', numberOfRepetitions, 'repetitions.');
  }, intervalTime * numberOfRepetitions);

  useEffect(() => {
    const liveUsersCountRef = ref(database, `tables/table${tableNum}/liveUsers`);

    // Listen for changes to liveUsers and update the UI
    const unsubscribe = onValue(liveUsersCountRef, (snapshot) => {
      const liveUserData = snapshot.val() || {};
      let liveUserCount = 0;

      // Count unique users by counting the number of unique session IDs per user
      Object.keys(liveUserData).forEach((user) => {
        // liveUserCount += liveUserData[user].length;
        liveUserCount += 1;
      });

      setLiveUserCount(liveUserCount); // Update liveUserCount in state
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div
      className={`basis-1/3 ${index === 2 ? 'mr-0' : 'mr-[25px]'
        }  flex justify-center`}
    >
      <div className='flex flex-col'>
        <div className='w-fit'>
          <div
            className={`${currentLock ? 'invisible' : 'visible'
              } relative z-0 top-[10px] right-[10px]  text-white text-center w-[40px] rounded-full px-[5px] py-[3px] shadow ` + (isDarkMode ? "bg-[#CF0303]" : "bg-red-400")}
          >
            <div className='flex justify-center'>
              <UserIcon className='h-3 w-3 mr-[2px] mt-[4px] text-[17px]' />
              <span className='text-[13px] font-bold'>
                {/* {showRandom ? randomNum : findUniqueSnapshots(snapshotsTable)?.length} */}
                {bots + liveUserCount}
              </span>
            </div>
          </div>
          <div
            className={`${currentLock
              ? isDarkMode ? 'border border-[#F7931A] bg-background' :
                'border-gray-200 bg-gray-200'
              : totalBalance >= tableAmount
                ? isDarkMode ?
                  (' bg-transparent border border-[#0FBE00] text-white ') :
                  ('border-[#BFF4BE] bg-[#BFF4BE] ')
                : ('border-amber-200 bg-amber-200')
              }  w-[75px] rounded-full px-5 py-6 text-center mb-[15px] mx-auto shadow text-gray-600 font-semibold`}
          >
            {tableAmount}
          </div>
        </div>

        <div className='w-full flex justify-center cursor-pointer'>
          {currentLock ? (
            <LockClosedIcon className={'h-5 w-5  mr-1 ' + (isDarkMode ? " text-[#F7931A]" : "text-gray-500")} />
          ) : totalBalance >= tableAmount ? (
            <div
              className={' w-fit h-[28px] font-bold text-center text-white rounded-full py-1 px-3 text-[13px] ' + (isDarkMode ? "bg-[#0FBE00]" : "bg-green-400")}
              onClick={() => handleJoinClick()}
            >
              JOIN
            </div>
          ) : (
            <Link to='/deposit'>
              <button className='bg-amber-300 flex w-fit h-[28px]  text-white font-bold py-1 px-3 rounded-full text-[13px]'>
                BUY <CurrencyEuroIcon className='h-5 w-4 text-white ml-1' />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Table

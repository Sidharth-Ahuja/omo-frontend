import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  LockClosedIcon,
  UserIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/solid';


import app from '../../../../config/firebase';
import { useList, useObject } from 'react-firebase-hooks/database';
import { ref, set, get, getDatabase } from 'firebase/database';


const database = getDatabase(app);


const Table = ({
  index,
  starNum,
  tableNum,
  tableAmount,
  tableTime,
  lockTime,
  minimumLimit,
}) => {
  const navigate = useNavigate();


  const NO_OF_BOTS = 11;


  const [snapshotsTable, loadingTable1, error1] = useList(
    ref(database, `users/table${tableNum}/players`)
  );


  const [minBotsSnapshot] = useObject(
    ref(database, `users/table${tableNum}/minBots`)
  );
  const [maxBotsSnapshot] = useObject(
    ref(database, `users/table${tableNum}/maxBots`)
  );
  const [totalCycleTimeSnapshot] = useObject(
    ref(database, `users/totalCycleTime`)
  );
  const [botUpdateTimeSnapshot] = useObject(
    ref(database, `users/botUpdateTime`)
  );
 
  // Fetch the values from snapshots
  const minBots = minBotsSnapshot?._node?.value_;
  const maxBots = maxBotsSnapshot?._node?.value_;
  const totalCycleTime = totalCycleTimeSnapshot?._node?.value_;
  const botUpdateTime = botUpdateTimeSnapshot?._node?.value_;
  
  const [bots, setBots] = useState(minBots);
  const [loading, setLoading] = useState(true); // Loading state
  
  let timePeriod = totalCycleTime * 60 * 60 * 1000; // Total time period
  
  // Use effect to set the time period based on totalCycleTime
  useEffect(() => {
    if (totalCycleTime) {
      timePeriod = totalCycleTime * 60 * 60 * 1000;
    }
  }, [totalCycleTime]);
  
  const intervalRef = useRef(null);
 
  useEffect(() => {
    // Check if all necessary data is available
    if (minBots !== undefined && maxBots !== undefined && botUpdateTime !== undefined) {
      setLoading(false); // Data is ready
    }
  }, [minBots, maxBots, botUpdateTime]);
 
  useEffect(() => {
    if (loading) return; // Don't proceed if still loading
 
    // Function to update current bots
    const updateBots = () => {
      let fraction = (Date.now() % timePeriod) / timePeriod; // Current time fraction in the cycle
      let currentBots;
      // Overall increase
      if (fraction < 0.5) {
        const randomness =
          Math.floor(Math.random() * 4) - Math.floor(Math.random() * 4); // randomness = [-3, 3]
        currentBots =
          minBots + (maxBots - minBots) * (fraction * 2) + randomness;
      }
      // Overall decrease
      else {
        const randomness =
          Math.floor(Math.random() * 4) - Math.floor(Math.random() * 4); // randomness = [-3, 3]
        currentBots =
          maxBots - (maxBots - minBots) * ((fraction - 0.5) * 2) + randomness;
      }
 
      // Ensure currentBots is within the min and max bounds
      currentBots = Math.min(
        Math.max(Math.round(currentBots), minBots),
        maxBots
      );
      setBots(currentBots); // Update state to trigger re-render
    };
 
    // Set interval to update bots at the specified frequency
    intervalRef.current = setInterval(updateBots, botUpdateTime * 1000); // Update every botUpdateTime seconds
 
    // Initial call to set bots immediately
    updateBots();
 
    // Cleanup function to clear the interval on unmount
    return () => clearInterval(intervalRef.current);
  }, [minBots, maxBots, botUpdateTime, loading]);
 


  const findUniqueSnapshots = (snapshots) => {
    var uniqueSnapshots = snapshots?.filter(
      (snapshots, index, self) =>
        index === self.findIndex((t) => t.key === snapshots.key)
    );
    return uniqueSnapshots;
  };


  return (
    <div
      className={`basis-1/3 ${
        index === 2 ? 'mr-0' : 'mr-[25px]'
      }  flex justify-center`}
    >
      <div className="flex flex-col">
        <div className="w-fit">
          <div
            className={` relative z-0 top-[10px] right-[10px] bg-red-400 text-white text-center w-[40px] rounded-full px-[5px] py-[3px] shadow `}
          >
            <div className="flex justify-center">
              <UserIcon className="h-3 w-3 mr-[2px] mt-[4px] text-[17px]" />
              <span className="text-[13px] font-bold">
                {/* {findUniqueSnapshots(snapshotsTable)?.length-NO_OF_BOTS} */}
                {bots}
              </span>
            </div>
          </div>
          <div
            className={`${'border-[#BFF4BE] bg-[#BFF4BE]'}  w-[75px] rounded-full px-5 py-6 text-center mb-[15px] mx-auto shadow text-gray-600 font-semibold`}
          >
            {tableAmount}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Table;
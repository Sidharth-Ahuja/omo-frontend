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
import { ref, set, get, getDatabase, onValue } from 'firebase/database';


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

  const findUniqueSnapshots = (snapshots) => {
    var uniqueSnapshots = snapshots?.filter(
      (snapshots, index, self) =>
        index === self.findIndex((t) => t.key === snapshots.key)
    );
    return uniqueSnapshots;
  };

  
  const [liveUserCount, setLiveUserCount] = useState(0)
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
                {liveUserCount}
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
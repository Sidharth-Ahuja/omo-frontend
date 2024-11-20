import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useObject } from 'react-firebase-hooks/database'
import { ref, set, get, getDatabase, onValue, remove, update, push } from 'firebase/database'
import app from '../../../config/firebase.ts'
import { getAuth } from 'firebase/auth'

const database = getDatabase(app)

const RealTimeUsers = () => {
  // const [users, setUsers] = useState<{ [key: string]: any }>({});

  // useEffect(() => {
  //   const usersRef = ref(database1, 'users');

  //   // Listen for changes in the users node
  //   const unsubscribe = onValue(usersRef, (snapshot) => {
  //     const usersData = snapshot.val();
  //     setUsers(usersData || {});
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);
  // const randomBaseAdditionArr = [8,6,9,3,2,6,1,4,5,7];

  // const liveUsers = Object.keys(users).filter((e: any)=>users[e].online).length;

  // const baseAdditionIndex = liveUsers%10;

  // const totalAddition = [...randomBaseAdditionArr].splice(0,baseAdditionIndex).reduce((a,b)=>a+b,0);
  const { number } = useParams()
  const [tableNum, setTableNum] = useState(Number(number))
  const [bots, setBots] = useState(0)
  const [liveUserCount, setLiveUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const auth = getAuth()
  const user = auth.currentUser
  const userId = user ? user.uid : null

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const paths = {
    minBots: `users/table${tableNum}/minBots`,
    maxBots: `users/table${tableNum}/maxBots`,
    totalCycleTime: `users/totalCycleTime`,
    botUpdateTime: `users/botUpdateTime`,
    liveUsers: `tables/table${tableNum}/liveUsers`,
  }
  
  const [minBotsSnapshot] = useObject(ref(database, paths.minBots))
  const [maxBotsSnapshot] = useObject(ref(database, paths.maxBots))
  const [totalCycleTimeSnapshot] = useObject(ref(database, paths.totalCycleTime))
  const [botUpdateTimeSnapshot] = useObject(ref(database, paths.botUpdateTime))
  
  const minBots = minBotsSnapshot?.val() ?? 0
  const maxBots = maxBotsSnapshot?.val() ?? 0
  const totalCycleTime = totalCycleTimeSnapshot?.val() ?? 24 // Default 24 hour
  const botUpdateTime = botUpdateTimeSnapshot?.val() ?? 60 // Default 60 seconds
  const liveUsersRef = ref(database, paths.liveUsers);
  
  useEffect(() => {
    // Stop if loading or invalid data
    if (
      loading ||
      minBots == null ||
      maxBots == null ||
      totalCycleTime == null ||
      botUpdateTime == null
    )
    return
    
    const timePeriod = totalCycleTime * 60 * 60 * 1000 // Convert hours to milliseconds
    
    const updateBots = () => {
      const fraction = ((Date.now()) % timePeriod) / timePeriod
      let currentBots
      
      // Apply randomness and enforce bounds
      let randomness = Math.floor(((Date.now()) + tableNum) % 7) - 3 // Randomness within [-3, 3]
      // Calculate bots based on the cycle phase
      if (fraction < 0.5) {
        currentBots = minBots + ((maxBots - minBots) * (fraction * 2))
        randomness--;
      } else {
        currentBots = maxBots - ((maxBots - minBots) * ((fraction - 0.5) * 2))
        randomness++;
      }
      
      currentBots = Math.min(
        Math.max(Math.round(currentBots) + randomness, minBots),
        maxBots
      )
      setBots(currentBots)
    }
    
    // Initial call and interval setup
    updateBots()
    intervalRef.current = setInterval(updateBots, botUpdateTime * 1000)
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    }
  }, [loading, minBots, maxBots, totalCycleTime, botUpdateTime])
  
  // Monitor loading state
  useEffect(() => {
    if (
      minBots != null &&
      maxBots != null &&
      totalCycleTime != null &&
      botUpdateTime != null
    ) {
      setLoading(false)
    }
  }, [minBots, maxBots, totalCycleTime, botUpdateTime])
  
  useEffect(() => {
    if (userId) {
      const sessionId = `tab-${Date.now()}`; // Unique session ID for this tab
  
      // Add user session ID to liveUsers if not already present
      const addUserToLiveUsers = async () => {
        const snapshot = await get(liveUsersRef);
        const liveUsersData = snapshot.val() || {};
  
        if (!liveUsersData[userId]) {
          // If user is not already in liveUsers, create an array for that user
          set(liveUsersRef, { ...liveUsersData, [userId]: [sessionId] });
        } else {
          // If user is in liveUsers, add the sessionId to the user's array of sessions
          const userSessions = liveUsersData[userId];
          if (!userSessions.includes(sessionId)) {
            userSessions.push(sessionId);
            set(liveUsersRef, { ...liveUsersData, [userId]: userSessions });
          }
        }
      };
  
      addUserToLiveUsers();

      const cleanupUserSession = async () => {
        const snapshot = await get(liveUsersRef);
        const liveUsersData = snapshot.val() || {};

        if (liveUsersData[userId]) {
          const userSessions = liveUsersData[userId];
          const newSessions = userSessions.filter((session) => session !== sessionId);

          if (newSessions.length > 0) {
            // If the user still has other sessions, update their sessions
            set(liveUsersRef, { ...liveUsersData, [userId]: newSessions });
          } else {
            // If all sessions are closed, remove the user from liveUsers
            remove(ref(database, `tables/table${tableNum}/liveUsers/${userId}`));
          }
        }
      };

      const handleBeforeUnload = (event) => {
        cleanupUserSession();
      };
      
      window.addEventListener("beforeunload", handleBeforeUnload);
      
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        const deacreaseUserLiveCount = async() => {
          await cleanupUserSession();
        }
        deacreaseUserLiveCount();
      };
    }
  }, []);
  

  // Listen for real-time updates to live user count
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
      style={{
        color: 'white',
        background: 'red',
        padding: '12px',
        borderRadius: '6px',
      }}
    >
      {bots + liveUserCount} Live
      {/* {bots + liveUserCount} Live */}
    </div>
  )
}

export default RealTimeUsers

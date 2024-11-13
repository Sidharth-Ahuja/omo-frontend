import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useObject } from 'react-firebase-hooks/database'
import { ref, set, get, getDatabase } from 'firebase/database'
import app from '../../../config/firebase.ts'

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
  const [loading, setLoading] = useState(true)

  const intervalRef = useRef(null)
  const paths = {
    minBots: `users/table${tableNum}/minBots`,
    maxBots: `users/table${tableNum}/maxBots`,
    totalCycleTime: `users/totalCycleTime`,
    botUpdateTime: `users/botUpdateTime`,
  }

  const [minBotsSnapshot] = useObject(ref(database, paths.minBots))
  const [maxBotsSnapshot] = useObject(ref(database, paths.maxBots))
  const [totalCycleTimeSnapshot] = useObject(
    ref(database, paths.totalCycleTime)
  )
  const [botUpdateTimeSnapshot] = useObject(ref(database, paths.botUpdateTime))

  const minBots = minBotsSnapshot?.val() ?? 0
  const maxBots = maxBotsSnapshot?.val() ?? 0
  const totalCycleTime = totalCycleTimeSnapshot?.val() ?? 24 // Default 24 hour
  const botUpdateTime = botUpdateTimeSnapshot?.val() ?? 60 // Default 60 seconds

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
      const fraction = ((Date.now()/10) % timePeriod) / timePeriod
      let currentBots

      // Calculate bots based on the cycle phase
      if (fraction < 0.5) {
        currentBots = minBots + (maxBots - minBots) * (fraction * 2)
      } else {
        currentBots = maxBots - (maxBots - minBots) * ((fraction - 0.5) * 2)
      }

      // Apply randomness and enforce bounds
      const randomness = Math.floor(((Date.now() / 10000) + tableNum) % 7) - 3 // Randomness within [-3, 3]
      currentBots = Math.min(
        Math.max(Math.round(currentBots + randomness), minBots),
        maxBots
      )
      setBots(currentBots)
    }

    // Initial call and interval setup
    updateBots()
    intervalRef.current = setInterval(updateBots, botUpdateTime * 1000)

    // Cleanup on unmount
    return () => clearInterval(intervalRef.current)
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

  return (
    <div
      style={{
        color: 'white',
        background: 'red',
        padding: '12px',
        borderRadius: '6px',
      }}
    >
      {/* {totalAddition + liveUsers} Live */}
      {bots} Live
    </div>
  )
}

export default RealTimeUsers

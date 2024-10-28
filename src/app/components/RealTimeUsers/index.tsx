import React from "react";
import { useEffect, useState } from 'react';
import { database1, ref, onValue } from '../..//firebase-int';

const RealTimeUsers = () => {
  const [users, setUsers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const usersRef = ref(database1, 'users');
    
    // Listen for changes in the users node
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      setUsers(usersData || {});
    });


    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  const randomBaseAdditionArr = [8,6,9,3,2,6,1,4,5,7];

  const liveUsers = Object.keys(users).filter((e: any)=>users[e].online).length;

  const baseAdditionIndex = liveUsers%10;

  const totalAddition = [...randomBaseAdditionArr].splice(0,baseAdditionIndex).reduce((a,b)=>a+b,0);

  return (
    <div style={{color:"white", background:"red", padding:"12px", borderRadius:"6px"}}>
        {totalAddition + liveUsers} Live
    </div>
  );
};

export default RealTimeUsers;

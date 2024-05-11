import { collection, getDoc, getDocs, query, where } from '@firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'

const FollowRequest = ({userId}) => {
 const[user, setUser] = useState({});
 useEffect(() => {
    const getUserDetailsById = async (userId) => {
      try {
        const userQuery = query(collection(db, 'users'), where('user.userId', '==', userId));
        const querySnapshot = await getDocs(userQuery);

        console.log('Query Snapshot:', querySnapshot);

        if (querySnapshot.docs.length > 0) {
          const userData = querySnapshot.docs[0].data().user;
          console.log('User Data:', userData);
          setUser(userData); 
        } else {
          console.error(`User with ID ${userId} not found`);
        }
      } catch (error) {
        console.error('Error fetching user details by ID:', error);
      }
    };

    if (userId) {
      getUserDetailsById(userId);
    }
  }, [userId]); 
  return (
    <div className='  rounded text-xl p-2 bg-white font-bold mr-4'>{user.name||'Loading...'}</div>
  )
}

export default FollowRequest
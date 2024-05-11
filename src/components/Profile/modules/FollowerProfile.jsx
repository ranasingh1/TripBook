import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import Loader from '../../Loader';

const FollowerProfile = ({ followerId }) => {
  const [followerData, setFollowerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowerData();
  }, []);

  const fetchFollowerData = async () => {
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==', followerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const follower = querySnapshot.docs[0].data().user;
        setFollowerData(follower);
      } else {
        console.error('Follower not found');
      }
    } catch (error) {
      console.error('Error fetching follower data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className=" bg-slate-800  text-white rounded py-2  w-44 mb-2 px-2 mt-4 shadow hover:bg-slate-800">
      <h2 className="text-xl text-center font-semibold ">{followerData?.name}</h2>
      {/* <div className="flex items-center justify-between ">
        <p className="text-gray-600">Followers: {followerData?.followers?.length || 0}</p>
        <p className="text-gray-600">Following: {followerData?.following?.length || 0}</p>
      </div> */}
    </div>
  );
};

export default FollowerProfile;

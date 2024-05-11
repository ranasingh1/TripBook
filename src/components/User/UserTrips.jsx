import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, where, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import FollowRequest from './FollowRequest';

const UserTrips = () => {
  const currentUser = useSelector((store) => store.auth.user);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
 const flag = useSelector(state=>state.trip)
  useEffect(() => {
    fetchUserTrips();
  }, [flag]);

  const fetchUserTrips = async () => {
    try {
      const q = query(collection(db, 'trips'), where('trip.userId', '==', currentUser.id));
      const querySnapshot = await getDocs(q);

      const tripsData = querySnapshot.docs.map((doc) => {
        const trip = doc.data().trip;
        return {
          id: doc.id,
          name: trip.name,
          destination: trip.destinations || [],
          startDate: trip.startDate,
          endDate: trip.endDate,
          activities: trip.activities || [],
          isPublic: trip.isPublic,
          joinRequests: trip.joinRequests || [],
          joinedUsers: trip.joinedUsers || [],
        };
      });

      console.log('User trips', tripsData);
      setUserTrips(tripsData);
    } catch (error) {
      console.error('Error fetching user trips:', error);
    } finally {
      setLoading(false);
    }
  };

  
  if (loading) {
    return <Loader />;
  }

  return (
    <div className='bg-white  w-auto flex flex-col justify-center  flex-wrap  mt-10   p-2 rounded shadow-amber-50'>
           <h2 className="text-2xl font-semibold mb-4">Upcoming Trips</h2>

           {userTrips.length>0?(
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {userTrips && userTrips?.map((trip) => (
        <div key={trip.id} className="border p-4 rounded-m shadow-md hover:scale-110">
          <h3 className="text-xl  font-bold text-orange-500 mb-2">{trip.name}</h3>
          <p className=''>Destination: {trip.destination}</p>
          <p>Start Date: {trip.startDate}</p>
          <p>End Date: {trip.endDate}</p>
          
        </div>
      ))}
    </div>
           ):(
            <h1 className=' m-2 text-gray-800'> It's So Empty here , Please add a Trip. </h1>
           )}
    </div>
  );
};

export default UserTrips;

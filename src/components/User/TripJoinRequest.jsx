import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, where, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import FollowRequest from './FollowRequest';

const TripJoinRequest = () => {
  const currentUser = useSelector((store) => store.auth.user);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTrips();
  }, []);

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

  const handleAcceptRequest = async (tripId, userId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await updateDoc(tripDocRef, {
        'trip.joinRequests': userTrips.find((trip) => trip.id === tripId).joinRequests.filter(
          (request) => request !== userId
        ),
        'trip.joinedUsers': [...userTrips.find((trip) => trip.id === tripId).joinedUsers, userId],
      });
      console.log('Join request accepted successfully');
    } catch (error) {
      console.error('Error accepting join request:', error);
    }
  };

  const handleRejectRequest = async (tripId, userId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await updateDoc(tripDocRef, {
        'trip.joinRequests': userTrips.find((trip) => trip.id === tripId).joinRequests.filter(
          (request) => request !== userId
        ),
      });
      console.log('Join request rejected successfully');
    } catch (error) {
      console.error('Error rejecting join request:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='bg-white p-8 ml-4'>
            <h2 className="text-2xl font-semibold mb-4">Your Trips</h2>

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userTrips.map((trip) => (
        <div key={trip.id} className="border p-4 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
          <p>Destination: {trip.destination}</p>
          <p>Start Date: {trip.startDate}</p>
          <p>End Date: {trip.endDate}</p>
          <p>Join Requests:</p>
          {trip.joinRequests.length > 0 ? (
            trip.joinRequests.map((userId) => (
              <div key={userId} className="flex items-center mb-2">
                <FollowRequest userId={userId}/>
                <button
                  className="bg-green-500 text-white px-4 py-2 mr-2"
                  onClick={() => handleAcceptRequest(trip.id, userId)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2"
                  onClick={() => handleRejectRequest(trip.id, userId)}
                >
                  Reject
                </button>
              </div>
            ))
          ) : (
            <p>No join requests</p>
          )}
        </div>
      ))}
    </div>
    </div>
  );
};

export default TripJoinRequest;

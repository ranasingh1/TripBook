import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../utils/helpers/formatDate';

const SearchUserProfile = () => {
  const currentUser = useSelector((store) => store.auth.user);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTrips, setUserTrips] = useState(null);
  const params = useParams();
  const { userId } = params;

  useEffect(() => {
    fetchUserData();
    fetchUserTrips();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data().user;
        setUserData(user);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const q = query(collection(db, 'trips'), where('trip.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const tripData = querySnapshot.docs.map((doc) => {
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

      console.log('t', tripData);
      setUserTrips(tripData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSendFollowRequest = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data().user;

        const pendingFollowRequest = Array.isArray(user.pendingFollowRequest) ? user.pendingFollowRequest : [];

        if (!pendingFollowRequest.includes(currentUser.id) && !user.followers.includes(currentUser.id)) {
          await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
            'user.pendingFollowRequest': [...pendingFollowRequest, currentUser.id],
          });

          console.log('Follow request sent successfully');
          fetchUserData()
          setLoading(false)
        } else {
          fetchUserData();
        }
      } else {
        console.error('User not found');
      }
      setLoading(false)
    } catch (error) {
      console.error('Error sending follow request:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data().user;

        const updatedFollowers = Array.isArray(user.followers) ? user.followers.filter((follower) => follower !== currentUser.id) : [];

        await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
          'user.followers': updatedFollowers,
        });

        console.log('Unfollowed successfully');
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const cancelFollowRequest = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data().user;

        const pendingFollowRequest = Array.isArray(userData.pendingFollowRequest) ? userData.pendingFollowRequest : [];

        if (pendingFollowRequest.includes(currentUser.id)) {
          const updatedRequests = pendingFollowRequest.filter(id => id !== currentUser.id);

          await updateDoc(doc(db, 'users', userDoc.id), {
            'user.pendingFollowRequest': updatedRequests,
          });

          console.log('Follow request canceled successfully');
          fetchUserData();
        } else {
          console.log('No pending follow request found');
          fetchUserData();
        }
      } else {
        console.error('User not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error canceling follow request:', error);
      setLoading(false);
    }
  };

  const handleJoinRequest = async (tripId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      const tripDocSnapshot = await getDoc(tripDocRef);

      if (tripDocSnapshot.exists()) {
        const trip = tripDocSnapshot.data();

        const pendingJoinRequests = Array.isArray(trip.joinRequests) ? trip.joinRequests : [];

        if (!pendingJoinRequests.includes(currentUser.id)) {
          await updateDoc(tripDocRef, {
            'trip.joinRequests': [...pendingJoinRequests, currentUser.id],
          });

          console.log('Join request sent successfully');
        } else {
          console.log('Join request already sent');
        }
      } else {
        console.error('Trip not found');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto max-w-2xl bg-white rounded p-8 mt-10 shadow-lg">
      <h2 className="text-3xl font-semibold mb-4">{userData?.name}</h2>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">Followers: {userData?.followers?.length || 0}</p>
        <p className="text-gray-600">Following: {userData?.following?.length || 0}</p>
      </div>

      <div className="mb-4 flex items-center">
        {!userData.acceptedFollowRequest?.includes(currentUser.id) && !userData.followers?.includes(currentUser.id) && (
          <button
            onClick={handleSendFollowRequest}
            className={`bg-blue-500 text-white px-4 py-2 rounded-md mr-2 transition duration-300 ease-in-out hover:bg-blue-600`}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            {userData.pendingFollowRequest.includes(currentUser.id) ? "Follow Request Sent" : "Send Follow Request"}
          </button>
        )}

        {userData.pendingFollowRequest?.includes(currentUser.id) && (
          <button
            onClick={cancelFollowRequest}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 transition duration-300 ease-in-out hover:bg-gray-600"
          >
            Cancel Follow Request
          </button>
        )}

        {userData.followers?.includes(currentUser.id) && (
          <button
            onClick={handleUnfollow}
            className="bg-red-500 text-white px-4 py-2 rounded-md mr-2 transition duration-300 ease-in-out hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faUserMinus} className="mr-2" />
            Unfollow
          </button>
        )}
      </div>

      {userTrips && (
        <div>
          <h4 className="text-2xl font-semibold mt-2 mb-3 text-center ">Trips</h4>

          {userTrips
            .map((trip) => (
              <div key={trip.id} className="border p-4 rounded-md hover:bg-slate-100 shadow-md mb-4">
                {(
                  <div>
                    {trip.activities.map((activity, index) => (
                      <div key={index} className="mb-2 mt-4 p-2   rounded">
                        <p className="font-semibold text-center">{activity.title}</p>
                        <p>Date: {formatDate(activity.date)}</p>
                        <p>Description: {activity.description}</p>
                        <p>Location: {activity.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchUserProfile;

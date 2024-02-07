import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, where, query, equal, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useSelector } from 'react-redux';
import Loader from '../Loader';
import FollowRequest from './FollowRequest';
import showToast from '../showToast';

const PendingFollowRequests = () => {
  const currentUser = useSelector((store) => store.auth.user.id);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserDocId,setCurrentUserDocId] = useState('');
  const [requestingUser , setRequestingUser] = useState({});

 useEffect(() => {
  const fetchPendingRequests = async () => {
    try {
      const q = query(collection(db, 'users'), where('user.userId', '==',currentUser));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot.docs);

      const requests = querySnapshot.docs.map((doc) =>{const user = doc.data().user;
        return {
          id: doc.id,
          pendingFollowRequest: user.pendingFollowRequest||[],
         
        };
      });
      console.log(requests);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchPendingRequests();
}, [currentUser]);


const handleAcceptRequest = async (requestingUser) => {
  try {
    let currentUserDocId = null;

    const userQuery = query(collection(db, 'users'), where('user.userId', '==', currentUser));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.docs.length > 0) {
      currentUserDocId = querySnapshot.docs[0].id;
      setCurrentUserDocId(currentUserDocId);
    } else {
      console.error('No matching documnt.');
      return;
    }

    const q = query(collection(db, 'users'), where('user.userId', '==', requestingUser));
    const qSnapshot = await getDocs(q);

    if (!qSnapshot.empty) {
      const requestingUserDoc = qSnapshot.docs[0];
      const requestingUserData = requestingUserDoc.data().user;

      const userRef = doc(db, 'users', currentUserDocId);
      const requestingUserRef = doc(db, 'users', requestingUserDoc.id);

      const currentUserData = (await getDoc(userRef)).data().user;
      const updatedFollowers = [...(currentUserData.followers || []), requestingUser];

      const updatedPendingRequests = pendingRequests[0].pendingFollowRequest.filter((f) => f !== requestingUser);

      const updatedFollowing = [...(requestingUserData.following || []), currentUser];

      await updateDoc(userRef, { 'user.pendingFollowRequest': updatedPendingRequests, 'user.followers': updatedFollowers });
      await updateDoc(requestingUserRef, { 'user.following': updatedFollowing });

      showToast('Request Accepted!', {
        duration: 3000,
        position: 'top-center', 
        style: {
          border: '1px solid ',
          padding: '4px',
          color: 'white',
          background: '#23C552',
        },
      });
 
      console.log(`Follow request for ${requestingUser} accepted successfully`);
      setPendingRequests([{ id: pendingRequests[0].id, pendingFollowRequest: updatedPendingRequests }]);
    } else {
      console.error(`Requesting user with ID ${requestingUser} not found`);
    }
  } catch (error) {
    console.error('Error accepting follow request:', error);
  }
};
  
  const handleRejectRequest = async (requestingUser) => {
    try {
      let currentUserDocId = null; 

    const userQuery = query(collection(db, 'users'), where('user.userId', '==', currentUser));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.docs.length > 0) {
      currentUserDocId = querySnapshot.docs[0].id;
      setCurrentUserDocId(currentUserDocId);
    } else {
      console.error('No matching document found for the current user.');
      return; 
    }

      const updatedPendingRequests = pendingRequests[0].pendingFollowRequest.filter(id => id !== requestingUser);
      const userRef = doc(db, 'users', currentUserDocId);
      await updateDoc(userRef, { 'user.pendingFollowRequest': updatedPendingRequests });
      showToast('Request Rejected!', {
        duration: 3000,
        position: 'top-center', 
        style: {
          border: '1px solid ',
          padding: '4px',
          color: 'white',
          background: '#23C552',
        },
      });
 
      console.log('Follow request rejected successfully');
      setPendingRequests([{ id: pendingRequests[0].id, pendingFollowRequest: updatedPendingRequests }]);

    } catch (error) {
      console.error('Error rejecting follow request:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }
  console.log()

  return (
    <div>
      <h2 className="text-2xl bg-black rounded text-white p-2 font-semibold mb-4">Follow Requests</h2>
      {pendingRequests.length > 0 &&pendingRequests[0]?.pendingFollowRequest ? (

        <ul>
          {pendingRequests[0]?.pendingFollowRequest.map((requestingUser) => (
            <li key={requestingUser.id} className="flex items-center justify-between border-b py-2 bg-white  rounded my-2 p-2">
              <FollowRequest userId={requestingUser}/>
              <div>
                {console.log('yp',requestingUser)}
                <button onClick={() => handleAcceptRequest(requestingUser)} className="bg-black text-white px-4 py-2 rounded-md mr-2">
                  Accept
                </button>
                <button onClick={() => handleRejectRequest(requestingUser)} className=" bg-blue-900 text-white px-4 py-2 rounded-md">
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No pending follow requests</p>
      )}
    </div>
  );
};

export default PendingFollowRequests;

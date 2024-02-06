import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from '@firebase/firestore';
import { db } from '../../firebase/firebase';
import showToast from '../showToast';

const UserTrips = ({ userId, tripCreated }) => {
  const [trips, setTrips] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [editActivityIndex, setEditActivityIndex] = useState(-1);
  const [editDestination, setEditDestination] = useState({
    tripId: '',
    destination: '',
  });

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'trips'), where('trip.userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const tripData = querySnapshot.docs.map((doc) => {
        const trip = doc.data().trip;
        return {
          id: doc.id,
          destination: trip.destinations,
          startDate: trip.startDate,
          endDate: trip.endDate,
          activities: trip.activities || [],
        };
      });

      setTrips(tripData);
    } catch (error) {
      console.error('Error fetching user trips:', error);
    }
  };

  const handleAddActivity = async (tripId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await updateDoc(tripDocRef, {
        'trip.activities': [
          ...trips.find((trip) => trip.id === tripId).activities,
          { title: newActivity, date: '', description: '', location: '' },
        ],
      });
      setNewActivity('');
      fetchData();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleEditActivity = (index) => {
    setEditActivityIndex(index);
  };

  const handleUpdateActivity = async (tripId, updatedActivity) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      const updatedActivities = trips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            activities: trip.activities.map((activity, index) =>
              index === editActivityIndex ? updatedActivity : activity
            ),
          };
        }
        return trip;
      });

      await updateDoc(tripDocRef, {
        'trip.activities': updatedActivities.find(
          (trip) => trip.id === tripId
        ).activities,
      });

      setEditActivityIndex(-1);
      setTrips(updatedActivities);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async (tripId, activityIndex) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      const currentActivities =
        trips.find((trip) => trip.id === tripId).activities || [];
      const updatedActivities = currentActivities.filter(
        (_, index) => index !== activityIndex
      );

      await updateDoc(tripDocRef, {
        'trip.activities': updatedActivities,
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };
  const handleDeleteTrip = async (tripId) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await deleteDoc(tripDocRef);
      fetchData();
      showToast('Trip Deleted', {
        duration: 3000,
        position: 'top-center', // You can choose the position
        style: {
          border: '1px solid ',
          padding: '4px',
          color: 'white',
          background: '#23C552',
        },
      });
 
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };
  const handleUpdateDestination = async (tripId, newDestination) => {
    try {
      const tripDocRef = doc(db, 'trips', tripId);
      await updateDoc(tripDocRef, {
        'trip.destinations': newDestination,
      });

      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === tripId ? { ...trip, destination: newDestination } : trip
        )
      );
    } catch (error) {
      console.error('Error updating destination:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userId, tripCreated]);

  return (
    <div className='flex w-full mx-auto'>
      <div className="p-8 my-4 w-full bg-white">
        <div className=' bg-black  flex   justify-center rounded my-4 p-2 text-white'>
        <h2 className="text-3xl font-bold ">Your Trips</h2>
        </div>
        <ul>
          {trips.map((trip) => (
            <li key={trip.id} className="mb-8 rounded border-4  border-black p-4">
              <div className="rounded my-2 justify-center flex  bg-blue-500 text-white ">
            <h1 className='p-2 font-bold   text-2xl'>{trip.name||'Trip'}</h1>
            </div>
              <p className=" flex text-xl font-bold mb-2 gap-2">
                
                <h1 className='p-2 rounded bg-slate-100'> Destination</h1> <span className=" rounded p-2 bg-black text-white">{trip.destination}</span>
                <button
                  className="ml-2  bg-green-400 hover:bg-blue-400 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setEditDestination({ tripId: trip.id, destination: trip.destination });
                  }}
                >
                  Edit
                </button>
              </p>
              {editDestination.tripId === trip.id && (
                <div>
                  <input
                    type="text"
                    value={editDestination.destination}
                    onChange={(e) => setEditDestination({ ...editDestination, destination: e.target.value })}
                    className="mr-2 p-2 border border-gray-300 rounded"
                  />
                  <button
                    className="bg-black text-white p-2 rounded"
                    onClick={() => {
                      handleUpdateDestination(editDestination.tripId, editDestination.destination);
                      setEditDestination({ tripId: '', destination: '' });
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="bg-black ml-2 text-white p-2 rounded"
                    onClick={() => {
                      setEditDestination({ tripId: '', destination: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <p className='flex gap-2 my-2'>
                <h1 className='p-2 rounded font-bold bg-slate-100 '>Dates</h1><span className='rounded p-2 bg-black text-white'> {trip.startDate||'00/00/0000'} to {trip.endDate||'00/00/00'}</span>
              </p>
              <div className=''>
                <p className="p-2 rounded font-bold bg-slate-100">Activities</p>
                <ul className=" my-2 rounded font-bold">
                  {trip.activities.map((activity, index) => (
                    <li key={index} className="mb-4 p-4  bg-slate-100 ">
                      <p className=' my-3'>Title <span className="ml-4 rounded p-2 bg-black text-white">{activity.title||'title'}</span></p>
                      <p className=' my-3' >Date <span className="ml-4 my-2 rounded p-2 bg-black text-white">{activity.date||'title'}</span></p>
                      <p className=' my-3'>Description <span className="ml-4  my-2 rounded p-2 bg-black text-white">{activity.description||'title'}</span></p>
                      <p className=' my-3'>Location <span className=" ml-4 my-2 rounded p-2 bg-black text-white">{activity.location||'title'}</span></p>
                      <div className=' flex gap-2'>
                        <button
                          className={`bg-green-400 text-white p-2 my-2 rounded ${editActivityIndex === index ? 'hidden' : ''}`}
                          onClick={() => handleEditActivity(index)}
                        >
                          Edit Activity
                        </button>
                        
                        <button
                          className="bg-red-900 text-white p-2 my-2 rounded "
                          onClick={() => handleDeleteActivity(trip.id, index)}
                        >
                          Delete Activity
                        </button>
                      </div>
                      {editActivityIndex === index && (
                          <div className='flex-flex-wrap my-2 w-full'>
                            <input
                              type="text"
                              placeholder='Title'
                              value={activity.title}
                              onChange={(e) => {
                                const updatedActivity = { ...activity, title: e.target.value };
                                handleUpdateActivity(trip.id, updatedActivity);
                              }}
                              className="mr-2 my-2 p-2 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder='Date'
                              value={activity.date}
                              onChange={(e) => {
                                const updatedActivity = { ...activity, date: e.target.value };
                                handleUpdateActivity(trip.id, updatedActivity);
                              }}
                              className="mr-2 my-2 p-2 border border-gray-300 rounded"
                            />
                            <input
                            placeholder='Description'
                              type="text"
                              value={activity.description}
                              onChange={(e) => {
                                const updatedActivity = { ...activity, description: e.target.value };
                                handleUpdateActivity(trip.id, updatedActivity);
                              }}
                              className="mr-2 my-2 p-2 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={activity.location}
                              placeholder='lacation'

                              onChange={(e) => {
                                const updatedActivity = { ...activity, location: e.target.value };
                                handleUpdateActivity(trip.id, updatedActivity);
                              }}
                              className="mr-2 p-2 border border-gray-300 rounded"
                            />
                            <button
                              className="bg-black hover:bg-slate-400 my-2 text-white px-2 py-1 rounded mr-2"
                              onClick={() => setEditActivityIndex(-1)}
                            >
                              Update Activity
                            </button>
                            <button
                              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                              onClick={() => setEditActivityIndex(-1)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
               
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDeleteTrip(trip.id)}
                >
                  Delete Trip
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserTrips;

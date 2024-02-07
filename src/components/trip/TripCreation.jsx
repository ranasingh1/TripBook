import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/firebase';
import { addDoc, collection } from '@firebase/firestore';
import UserTrips from './UserTrips';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '../../constants';
import showToast from '../showToast';

const TripCreation = () => {
  const [newDestination, setNewDestination] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '',
    date: '',
    description: '',
    location: '',
  });
  const [userId, setUserId] = useState(null);
  const [tripData, setTripData] = useState({
    name:'',
    destinations: [],
    startDate: '',
    endDate: '',
    activities: [],
    isPublic: true,
    joinRequests:[],
    joinedUsers:[]
  });

  const [tripCreated, setTripCreated] = useState(false);
  const [destCord, setDestCord] = useState([]);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 1,
    });
    console.log(destCord);

    destCord.forEach(async (destination) => {
      const { latitude, longitude } = destination;
      new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);
    });

    return () => map.remove();
  }, [destCord]);
  const toggleTripPrivacy = () => {
    setTripData((prevTripData) => ({
      ...prevTripData,
      isPublic: !prevTripData.isPublic,
    }));
  };
  const getCoordinates = async (destination) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${destination}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
    
        const [longitude, latitude] = data.features[0].center;
  
        return { longitude, latitude };
      } else {
        console.error('Invalid response from Mapbox Geocoding API:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching coordinates from Mapbox Geocoding API:', error);
      return null;
    }
  };
  
  const handleSetDestination = async () => {
    if (newDestination.trim() !== '') {
      const coordinates = await getCoordinates(newDestination.trim(''));

      if (coordinates) {
        setTripData((prevTripData) => ({
          ...prevTripData,
          destinations: [...prevTripData.destinations, newDestination.trim()],
        }));
        setDestCord((prevData) => [...prevData, coordinates]);
        setNewDestination('');
      } else {
        console.error('Coordinates not available for destination:', newDestination.trim());
      }
    }
  };

  const handleRemoveDestination = (index) => {
    setTripData((prevTripData) => {
      const updatedDestinations = [...prevTripData.destinations];
      updatedDestinations.splice(index, 1);

      return {
        ...prevTripData,
        destinations: updatedDestinations,
      };
    });

    setDestCord((prevData) => {
      const updatedCords = [...prevData];
      updatedCords.splice(index, 1);

      return updatedCords;
    });
  };
  

  const handleAddActivity = () => {
    if (newActivity.title.trim() !== '' && newActivity.date.trim() !== '') {
      setTripData((prevTripData) => ({
        ...prevTripData,
        activities: [...prevTripData.activities, { ...newActivity }],
      }));
      setNewActivity({
        title: '',
        date: '',
        description: '',
        location: '',
      });
    }
  };

  const handleCreateTrip = async () => {
    try {
      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      const tripDataWithUser = {
        ...tripData,
        userId: userId,
      };

      const tripRef = await addDoc(collection(db, 'trips'), {
        trip: tripDataWithUser,
      });
      setTripCreated(true);
      showToast('Trip Created Succesfully!', {
        duration: 3000,
        position: 'top-center', 
        style: {
          border: '1px solid ',
          padding: '4px',
          color: 'white',
          background: '#23C552',
        },
      });
      console.log('Trip created with ID');
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <div className="md:flex w-full ">
   <div className=' w-1/2 p-8 m-4 bg-white'>
  <h2 className="text-2xl font-bold mb-4">Create New Trip</h2>
  <div className="mb-4">
    <label className="my-2 font-bold text-xl">Name</label>
    <input
      type="text"
      value={tripData.name}
      onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
      className="w-full border border-gray-300 rounded px-3 py-2"
    />
  </div>
  <div className="mb-4">
  <label className="my-2 font-bold text-xl flex items-center">
   {tripData.isPublic ? "Public" : "Private"}
  <button onClick={toggleTripPrivacy} className={`ml-4 relative inline-block w-11 h-6 rounded-full transition-all duration-300 ${tripData.isPublic ? 'bg-green-500' : 'bg-red-500'}`}>
    <span className={`absolute inset-0.5 w-5 h-5 bg-white rounded-full shadow-md transform ${tripData.isPublic ? 'translate-x-full' : 'translate-x-0'}`}></span>
  </button>
</label>

  </div>
  <div className="mb-4">
    <label className="my-2 font-bold text-xl">Destination</label>
    <input
      type="text"
      value={newDestination}
      onChange={(e) => setNewDestination(e.target.value)}
      className="w-full border border-gray-300 rounded px-3 py-2"
    />
    <button onClick={handleSetDestination} className=" my-2 p-2 bg-black hover:bg-blue-400 text-white rounded">
      Add Destination
    </button>
    <div id="map" className="w-full h-64 bg-gray-300 mt-4 rounded"></div>

  </div>
  {tripData.destinations.length > 0 && (
    <div className="mb-4">
      <p className="my-2 font-bold text-xl">Destinations</p>
      <ul className='flex gap-4  flex-wrap  p-1 bg rounded '>
        {tripData.destinations.map((destination, index) => (
          <li className='rounded flex ' key={index}>
            <div className='p-2 bg-white border border-blue-200 rounded'>{destination}</div>
          <button
          onClick={() => handleRemoveDestination(index)}
          className="ml-2  rounded p-2 text-white  bg-slate-950 hover:bg-red-500"
        >
          Remove
        </button>
        </li>
        ))}
      </ul>
    </div>
  )}
  <div className=' flex flex-wrap gap-2 mb-4'>
  <div className="">
    <label className="my-2 font-bold text-xl">Start Date</label>
    <input
      type="date"
      value={tripData.startDate}
      onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
      className="ml-3 border border-gray-300 rounded p-1"
    />
  </div>
  <div className="">
    <label className="my-2 font-bold text-xl">End Date</label>
    <input
      type="date"
      value={tripData.endDate}
      onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
      className="ml-3 border border-gray-300 rounded p-1"
    />
  </div>
  </div>
  <div className="mb-4">
    <label className="my-2 font-bold text-xl">Activities</label>
    <ul>
      {tripData.activities.map((activity, index) => (
        <li className='flex flex-wrap text-bold text-white gap-2 m-2' key={index}>
          <p className=' rounded border   bg-black text-white  border-black p-1 ' > {activity.title}</p>
          <p className=' rounded border  bg-black text-white border-black p-1' >{activity.date}</p>
          <p className=' rounded border  bg-black text-white border-black p-1' >{activity.description}</p>
          <p className=' rounded border  bg-black text-white border-black p-1' >{activity.location}</p>
        </li>
      ))}
    </ul>
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Title"
        value={newActivity.title}
        onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2 w-1/4"
      />
      <input
        type="date"
        value={newActivity.date}
        onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Description"
        value={newActivity.description}
        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Location"
        value={newActivity.location}
        onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
        className="border border-gray-300 rounded px-3 py-2"
      />
      <button onClick={handleAddActivity} className="bg-black hover:bg-blue-400 text-white px-3 py-1 rounded">
        Add Activity
      </button>
    </div>
  </div>
  <button onClick={handleCreateTrip} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
    Create Trip
  </button>
</div>
<div className='w-1/2'>
  <UserTrips userId={userId} trip={tripCreated} />
  </div>
</div>
  );
};

export default TripCreation;

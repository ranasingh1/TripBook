import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/firebase';
import { addDoc, collection } from '@firebase/firestore';
import UserTrips from './EditTrips';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faLock, faMapMarkerAlt, faTrashAlt, faCalendarAlt, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import showToast from '../showToast';
import { MAPBOX_ACCESS_TOKEN } from '../../constants';
import TripJoinRequest from '../User/UserTrips';
import ActivitiesCard from './modules/ActivitiesCard';
import { useDispatch } from 'react-redux';
import { stateChange } from '../../utils/tripSlice';

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
  const dispatch = useDispatch();
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
  
    if (tripData.destinations.length > 0) {
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [78.9629, 20.5937],
        zoom: 1,
      });
  
      navigator.geolocation.getCurrentPosition(function (position) {
        const { latitude, longitude } = position.coords;
        map.setZoom(12);
      });
  
      destCord.forEach(async (destination) => {
        const { latitude, longitude } = destination;
        new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map);
        map.setCenter([longitude, latitude]);
      });
  
      return () => map?.remove();
    }
  }, [tripData.destinations, destCord]);
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
      dispatch(stateChange(true))
      console.log('Trip created with ID');
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <div className={` flex justify-centre mt-10 items-center mb-10 w-full`}>
      <motion.div
         initial={{ opacity: 0, y: -50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       className=' flex flex-wrap   bg-white w-full  '>
    <div
   
      className=" mb-2 grid grid-cols-1   outline outline-2 rounded  bg-white w-full  m-2 p-8 "
    >
      <h2 className="text-3xl font-bold text-indigo-800 mb-6">Create New Trip</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-lg text-gray-700">Name</label>
          <input
            type="text"
            value={tripData.name}
            onChange={(e) => setTripData({ ...tripData, name: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
          />
        </div>
        <div>
          <label className="text-lg text-gray-700">Privacy</label>
          <div className="flex items-center mt-2">
            <div
              onClick={toggleTripPrivacy}
              className={`relative inline-block w-10 h-5 rounded-full cursor-pointer ${
                tripData.isPublic ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <div
                className={`absolute inset-0.5 w-4 h-4 bg-white rounded-full shadow-md transform ${
                  tripData.isPublic ? 'translate-x-full' : 'translate-x-0'
                } transition-transform duration-300 ease-in-out`}
              ></div>
            </div>
            <span className="ml-2 text-gray-600">{tripData.isPublic ? <FontAwesomeIcon icon={faUserGroup}/> : <FontAwesomeIcon icon={faLock}/>}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
  <div>
    <label className="text-lg text-gray-700">Start Date</label>
    <div className="flex items-center mt-2">
      <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-800 mr-2" />
      <input
        type="date"
        value={tripData.startDate}
        onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
        className="uppercase w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
      />
    </div>
  </div>
  <div>
    <label className="text-lg text-gray-700">End Date</label>
    <div className="flex items-center mt-2">
      <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-800 mr-2" />
      <input
        type="date"
        value={tripData.endDate}
        onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
        className="w-full  uppercase border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
      />
    </div>
  </div>
</div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-lg text-gray-700">Destination</label>
          <div className="flex items-center mt-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-800 mr-2" />
            <input
              type="text"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              className="w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
            />
            <button
              onClick={handleSetDestination}
              className="ml-3 bg-indigo-600 hover:scale-110  hover:bg-indigo-700 text-white px-4  py-3  rounded transition duration-300"
            >
              Add 
            </button>
          </div>
         {tripData.destinations.length > 0 &&
<div id="map" className="w-full h-64 mt-4 rounded bg-gray-300"></div>}
        </div>

        {tripData.destinations.length > 0 ? (
          <div>
            <label className="text-lg text-gray-700">Destinations</label>
            <ul className="mt-2 space-y-2">
              {tripData.destinations.map((destination, index) => (
                <li key={index} className="flex items-center">
                  <div className="bg-indigo-600 text-white w-36  text-center rounded-md p-2 mr-2">{destination}</div>
                  <button
                    onClick={() => handleRemoveDestination(index)}
                    className="text-white hover:scale-110 bg-red-900 px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ):(            <label className="text-lg  text-slate-500">No Destinations Added yet</label>
             
        )}
      </div>
 
      <div className="mb-6">
        <label className="text-lg text-gray-700">Activities</label>
        <div className="mt-2 flex flex-wrap gap-1">
          {tripData.activities.map((activity, index) => (
            // <li key={index} className="flex items-center">
            //   <div className="bg-indigo-600 text-white rounded-md p-2 mr-2">{activity.title}</div>
            //   <div className="bg-indigo-600 text-white rounded-md p-2 mr-2">{activity.date}</div>
            //   <div className="bg-indigo-600 text-white rounded-md p-2 mr-2">{activity.description}</div>
            //   <div className="bg-indigo-600 text-white rounded-md p-2 mr-2">{activity.location}</div>
            // </li>
            <ActivitiesCard activities={activity}/>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <input
            type="text"
            placeholder="Title"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
          />
          <input
            type="date"
            value={newActivity.date}
            onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
            className=" uppercase w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
          />
          <input
            type="text"
            placeholder="Description"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
          />
          <input
            type="text"
            placeholder="Location"
            value={newActivity.location}
            onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
            className="w-full border rounded-md p-3 focus:outline-none focus:border-indigo-500 transition duration-300"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddActivity}
            className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-300"
          >
            Add Activity
          </motion.button>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCreateTrip}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-300"
        >
          Create Trip
        </motion.button>
      </div>
    </div>
      </motion.div>
  </div>
);
};

export default TripCreation;

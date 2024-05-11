import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faEdit,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "@firebase/firestore";
import { db } from "../../firebase/firebase";
import showToast from "../showToast";
import { useDispatch, useSelector } from "react-redux";
import { stateChange } from "../../utils/tripSlice";
import { formatDate } from "../../utils/helpers/formatDate";

const EditTrips = ({  tripCreated }) => {
  const [trips, setTrips] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const [editActivityIndex, setEditActivityIndex] = useState(-1);
  const [editDestination, setEditDestination] = useState({
    tripId: "",
    destination: "",
  });
  const [expandedTripId, setExpandedTripId] = useState(null);
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.user.id);
  const flag = useSelector(state=>state.trip)

  const fetchData = async () => {
    try {
      const q = query(
        collection(db, "trips"),
        where("trip.userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      const tripData = querySnapshot.docs.map((doc) => {
        const trip = doc.data().trip;
        return {
          id: doc.id,
          name: trip.name,
          destination: trip.destinations,
          startDate: trip.startDate,
          endDate: trip.endDate,
          activities: trip.activities || [],
        };
      });
      // setExpandedTripId(tripData[0].id)
      setTrips(tripData);
    } catch (error) {
      console.error("Error fetching user trips:", error);
    }
  };

  const handleAddActivity = async (tripId) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      await updateDoc(tripDocRef, {
        "trip.activities": [
          ...trips.find((trip) => trip.id === tripId).activities,
          { title: newActivity, date: "", description: "", location: "" },
        ],
      });
      setNewActivity("");
      fetchData();
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const handleEditActivity = (index) => {
    setEditActivityIndex(index);
  };

  const handleUpdateActivity = async (tripId, updatedActivity) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
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
        "trip.activities": updatedActivities.find((trip) => trip.id === tripId)
          .activities,
      });

      setEditActivityIndex(-1);
      setTrips(updatedActivities);
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const handleDeleteActivity = async (tripId, activityIndex) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      const currentActivities =
        trips.find((trip) => trip.id === tripId).activities || [];
      const updatedActivities = currentActivities.filter(
        (_, index) => index !== activityIndex
      );

      await updateDoc(tripDocRef, {
        "trip.activities": updatedActivities,
      });
     
      fetchData();
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      await deleteDoc(tripDocRef);
      fetchData();
      showToast("Trip Deleted", {
        duration: 3000,
        position: "top-center",
        style: {
          border: "1px solid ",
          padding: "4px",
          color: "white",
          background: "#23C552",
        },
      });
      dispatch(stateChange(true))
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const handleUpdateDestination = async (tripId, newDestination) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      await updateDoc(tripDocRef, {
        "trip.destinations": newDestination,
      });

      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === tripId ? { ...trip, destination: newDestination } : trip
        )
      );
    } catch (error) {
      console.error("Error updating destination:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, tripCreated, flag]);

  return (
    <div className="w-full h-full  rounded mt-2  ">
      <div className="flex  rounded  my-1 mx-1    ">
       {trips.length>0 ? (<h2 className="text-2xl font-bold">Edit Trips</h2>):""} 
      </div>

      <div className=" my-4 w-full bg-white">
        <ul className="flex gap-4 flex-wrap ">
          {trips.map((trip) => (
            <li
              key={trip.id}
              className="mb-8 rounded translate-x-5 transition-all  flex duration-300 hover:scale-105"
            >
              <div
                className={`rounded my-2 justify-between  items-center flex  w-36 h-14 py-4 hover:scale-110  ${
                  expandedTripId == trip.id ? "hidden" : "flex"
                } text-black outline outline-2 cursor-pointer`}
                onClick={() =>
                  setExpandedTripId((prevId) =>
                    prevId === trip.id ? null : trip.id
                  )
                }
              >
                <h1 className="p-2 font-bold text-l">{trip.name || "Trip"}</h1>
                <FontAwesomeIcon
                  icon={
                    expandedTripId === trip.id ? faChevronUp : faChevronDown
                  }
                  className="text-2xl p-2"
                />
              </div>
              {expandedTripId === trip.id && (
                <div className=" w-[24rem] outline bg-white  p-2 rounded shadow-sm ">
                  <div className="flex gap-2 my-2 py-2 shadow" >
                    <p className="p-2  text-xl font-bold">Destinations</p>

                    <span className="rounded p-2 outline outline-2   hover:bg-indigo-300 text-black">
                      {trip.destination}
                    </span>
                    <button
                      className="ml-2 hover:scale-110  rounded transition duration-300"
                      onClick={() => {
                        setEditDestination({
                          tripId: trip.id,
                          destination: trip.destination,
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} className=" h-9 w-9"/>
                    </button>
                  </div>
                  {editDestination.tripId === trip.id && (
                    <div>
                      <input
                        type="text"
                        value={editDestination.destination}
                        onChange={(e) =>
                          setEditDestination({
                            ...editDestination,
                            destination: e.target.value,
                          })
                        }
                        className="mr-2 p-2 border border-gray-300 rounded"
                      />
                      <button
                        className="bg-black  hover:scale-110 text-white p-2 rounded"
                        onClick={() => {
                          handleUpdateDestination(
                            editDestination.tripId,
                            editDestination.destination
                          );
                          setEditDestination({ tripId: "", destination: "" });
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="bg-black  hover:scale-110 ml-2 text-white p-2 rounded"
                        onClick={() => {
                          setEditDestination({ tripId: "", destination: "" });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 my-2 py-2 shadow">
                    <p className="p-2 pt-3 rounded font-bold text-xl"> Start Date</p>
                    <span className="rounded p-2 text-balck outline outline-2 my-2 ml-6 hover:bg-indigo-400">
                      {" "}
                      { formatDate( trip.startDate )|| "00/00/0000"} 
                    </span>
                  </div>
                  <div className="mb-4 flex py-2 shadow">
                    <p className="p-2 pt-3 rounded font-bold text-xl">Activities</p>
                    <ul className="">
                      {trip.activities.map((activity, index) => (
                        <li key={index} className=" flex flex-wrap">
                          <p className="m-2 outline outline-2 ml-10 p-2 rounded ">
                            {activity.title || "title"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              className=" hover:scale-110  m-2 rounded transition duration-300"
                              onClick={() => handleEditActivity(index)}
                            >
                      <FontAwesomeIcon icon={faEdit} className=" h-9 w-9"/>
                            </button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="  my-2 rounded"
                              onClick={() =>
                                handleDeleteActivity(trip.id, index)
                              }
                            >
                              <FontAwesomeIcon icon={faTrashAlt} className=" h-8 w-8" />
                            </motion.button>
                          </div>
                          {editActivityIndex === index && (
                            <div className="flex flex-wrap my-2 w-full">
                              <input
                                type="text"
                                placeholder="Title"
                                value={activity.title}
                                onChange={(e) => {
                                  const updatedActivity = {
                                    ...activity,
                                    title: e.target.value,
                                  };
                                  handleUpdateActivity(
                                    trip.id,
                                    updatedActivity
                                  );
                                }}
                                className="mr-2 my-2 p-2 border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                placeholder="Date"
                                value={activity.date}
                                onChange={(e) => {
                                  const updatedActivity = {
                                    ...activity,
                                    date: e.target.value,
                                  };
                                  handleUpdateActivity(
                                    trip.id,
                                    updatedActivity
                                  );
                                }}
                                className="mr-2 my-2 p-2 border border-gray-300 rounded"
                              />
                              <input
                                placeholder="Description"
                                type="text"
                                value={activity.description}
                                onChange={(e) => {
                                  const updatedActivity = {
                                    ...activity,
                                    description: e.target.value,
                                  };
                                  handleUpdateActivity(
                                    trip.id,
                                    updatedActivity
                                  );
                                }}
                                className="mr-2 my-2 p-2 border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                value={activity.location}
                                placeholder="Location"
                                onChange={(e) => {
                                  const updatedActivity = {
                                    ...activity,
                                    location: e.target.value,
                                  };
                                  handleUpdateActivity(
                                    trip.id,
                                    updatedActivity
                                  );
                                }}
                                className="mr-2 p-2 border border-gray-300 rounded"
                              />
                              <button
                              
                                className="bg-black hover:scale-110 my-2 text-white px-2 py-1 rounded mr-2"
                                onClick={() => setEditActivityIndex(-1)}
                              >
                                Edit 
                              </button>
                              <button
                                className="bg-black hover:scale-110 my-2 text-white px-2 py-1 rounded mr-2"
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
                  <div className="mt-4  gap-2 flex justify-between">
                   
                    <button
                      className="bg-indigo-600 hover:scale-110 text-white px-2 py-1 rounded"
                      onClick={() =>
                        setExpandedTripId((prevId) =>
                          prevId === trip.id ? null : trip.id
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faChevronUp}/>
                    </button>
                    <button
                      className="bg-black hover:bg-red-400 hover:scale-110 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt}/>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditTrips;

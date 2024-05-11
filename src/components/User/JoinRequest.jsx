import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Loader from "../Loader";
import { useSelector } from "react-redux";
import FollowRequest from "./FollowRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleUser,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const JoinRequest = () => {
  const currentUser = useSelector((store) => store.auth.user);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const fetchUserTrips = async () => {
    try {
      const q = query(
        collection(db, "trips"),
        where("trip.userId", "==", currentUser.id)
      );
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

      console.log("User trips", tripsData);
      setUserTrips(tripsData);
    } catch (error) {
      console.error("Error fetching user trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (tripId, userId) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      await updateDoc(tripDocRef, {
        "trip.joinRequests": userTrips
          .find((trip) => trip.id === tripId)
          .joinRequests.filter((request) => request !== userId),
        "trip.joinedUsers": [
          ...userTrips.find((trip) => trip.id === tripId).joinedUsers,
          userId,
        ],
      });
      console.log("Join request accepted successfully");
    } catch (error) {
      console.error("Error accepting join request:", error);
    }
  };

  const handleRejectRequest = async (tripId, userId) => {
    try {
      const tripDocRef = doc(db, "trips", tripId);
      await updateDoc(tripDocRef, {
        "trip.joinRequests": userTrips
          .find((trip) => trip.id === tripId)
          .joinRequests.filter((request) => request !== userId),
      });
      console.log("Join request rejected successfully");
    } catch (error) {
      console.error("Error rejecting join request:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className=" bg-white  w-80 flex flex-col justify-center  flex-wrap   p-2 rounded shadow-amber-50">
      <div className=" flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">Trip requests</h2>

        {userTrips.joinRequests?.length > 0 ? (
          userTrips.map((trip) => (
            <>
              {trip.joinRequests.length > 0 && (
                <>
                  <h1 className="  font-extrabold text-l">
                    You have a Join request for {trip.name}.
                  </h1>

                  {trip.joinRequests.map((userId) => (
                    <li
                      key={trip.id}
                      className="flex items-center justify-between border-b rounded-lg mt-2 p-2 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      {" "}
                      <FontAwesomeIcon
                        icon={faCircleUser}
                        className="h-8 w-8"
                      />
                      <FollowRequest userId={userId} />
                      <button
                        className="bg-black text-white px-4 py-2  rounded-3xl"
                        onClick={() => handleAcceptRequest(trip.id, userId)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        className="bg-red-500 rounded-3xl text-white px-4 py-2"
                        onClick={() => handleRejectRequest(trip.id, userId)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </li>
                  ))}
                </>
              )}
            </>
          ))
        ) : (
          <>No Notifications Yet</>
        )}
      </div>
    </div>
  );
};

export default JoinRequest;

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  where,
  query,
  equal,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import FollowRequest from "./FollowRequest";
import showToast from "../showToast";
import {
  faCheck,
  faCircleUser,
  faFaceGrin,
  faTimes,
  faUser,
  faUserAltSlash,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PendingFollowRequests = () => {
  const currentUser = useSelector((store) => store.auth.user.id);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserDocId, setCurrentUserDocId] = useState("");
  const [requestingUser, setRequestingUser] = useState({});

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("user.userId", "==", currentUser)
        );
        const querySnapshot = await getDocs(q);

        const requests = querySnapshot.docs.map((doc) => {
          const user = doc.data().user;
          return {
            id: doc.id,
            pendingFollowRequest: user.pendingFollowRequest || [],
          };
        });

        setPendingRequests(requests);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [currentUser]);

  const handleAcceptRequest = async (requestingUser) => {
    try {
      let currentUserDocId = null;

      const userQuery = query(
        collection(db, "users"),
        where("user.userId", "==", currentUser)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.docs.length > 0) {
        currentUserDocId = querySnapshot.docs[0].id;
        setCurrentUserDocId(currentUserDocId);
      } else {
        console.error("No matching document.");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("user.userId", "==", requestingUser)
      );
      const qSnapshot = await getDocs(q);

      if (!qSnapshot.empty) {
        const requestingUserDoc = qSnapshot.docs[0];
        const requestingUserData = requestingUserDoc.data().user;

        const userRef = doc(db, "users", currentUserDocId);
        const requestingUserRef = doc(db, "users", requestingUserDoc.id);

        const currentUserData = (await getDoc(userRef)).data().user;
        const updatedFollowers = [
          ...(currentUserData.followers || []),
          requestingUser,
        ];

        const updatedPendingRequests =
          pendingRequests[0].pendingFollowRequest.filter(
            (f) => f !== requestingUser
          );

        const updatedFollowing = [
          ...(requestingUserData.following || []),
          currentUser,
        ];

        await updateDoc(userRef, {
          "user.pendingFollowRequest": updatedPendingRequests,
          "user.followers": updatedFollowers,
        });
        await updateDoc(requestingUserRef, {
          "user.following": updatedFollowing,
        });

        showToast("Request Accepted!", {
          duration: 3000,
          position: "top-center",
          style: {
            border: "1px solid ",
            padding: "4px",
            color: "white",
            background: "#23C552",
          },
        });

        setPendingRequests([
          {
            id: pendingRequests[0].id,
            pendingFollowRequest: updatedPendingRequests,
          },
        ]);
      } else {
        console.error(`Requesting user with ID ${requestingUser} not found`);
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };

  const handleRejectRequest = async (requestingUser) => {
    try {
      let currentUserDocId = null;

      const userQuery = query(
        collection(db, "users"),
        where("user.userId", "==", currentUser)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.docs.length > 0) {
        currentUserDocId = querySnapshot.docs[0].id;
        setCurrentUserDocId(currentUserDocId);
      } else {
        console.error("No matching document found for the current user.");
        return;
      }

      const updatedPendingRequests =
        pendingRequests[0].pendingFollowRequest.filter(
          (id) => id !== requestingUser
        );
      const userRef = doc(db, "users", currentUserDocId);
      await updateDoc(userRef, {
        "user.pendingFollowRequest": updatedPendingRequests,
      });
      showToast("Request Rejected!", {
        duration: 3000,
        position: "top-center",
        style: {
          border: "1px solid ",
          padding: "4px",
          color: "white",
          background: "#23C552",
        },
      });

      setPendingRequests([
        {
          id: pendingRequests[0].id,
          pendingFollowRequest: updatedPendingRequests,
        },
      ]);
    } catch (error) {
      console.error("Error rejecting follow request:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {pendingRequests.length > 0 &&
      pendingRequests[0]?.pendingFollowRequest ? (
        <ul>
          {pendingRequests[0]?.pendingFollowRequest.map((requestingUser) => (
            <li
              key={requestingUser.id}
              className="flex items-center justify-between border-b  rounded-lg mt-2 p-2 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faCircleUser} className="h-8 w-8" />
              <FollowRequest userId={requestingUser} />
              <div>
                <button
                  onClick={() => handleAcceptRequest(requestingUser)}
                  className="bg-gradient-to-r from-[#071e26] to-[#040f13] text-white px-4 py-2 rounded-full mr-2 transition duration-300 ease-in-out hover:opacity-70"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={() => handleRejectRequest(requestingUser)}
                  className="bg-gradient-to-r from-rose-500 to-[#EE4B2B] text-white px-4 py-2 rounded-full transition duration-300 ease-in-out hover:opacity-70"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-600 bg-white p-2 rounded-lg">
          No pending follow requests
        </div>
      )}
    </div>
  );
};

export default PendingFollowRequests;

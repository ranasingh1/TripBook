import { collection, getDocs, query, where } from '@firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import Loader from '../../Loader';
import FollowerProfile from './FollowerProfile';
import { formatDate } from '../../../utils/helpers/formatDate';

const ProfileDetails = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userTrips, setUserTrips] = useState(null);
    const params = useParams();
    const { userId } = params;
    const [followersToggle, setFollowerToggle] = useState(false);
    const [followingToggle, setFollowingToggle] = useState(false);
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


    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container mx-auto max-w-2xl bg-white rounded p-8 mt-10 shadow-lg">
            <h2 className="text-3xl font-semibold mb-4">{userData?.name}</h2>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => {
                    setFollowingToggle(false)
                    setFollowerToggle(prev => !prev)
                }} className="text-gray-600 p-2 border rounded shadow">Followers: {userData?.followers?.length || 0}</button>
                <button
                    onClick={() => {
                        setFollowerToggle(false)
                        setFollowingToggle(prev => !prev)
                    }}
                    className="text-gray-600 p-2 border rounded shadow">Following: {userData?.following?.length || 0}</button>
            </div>


            {followingToggle && (<>
                {userData?.following.map((following) => (<FollowerProfile followerId={following} />))}
            </>
            )}
            {followersToggle && (<>
                {userData?.followers.map((following) => (<FollowerProfile followerId={following} />))}
            </>
            )}


            {userTrips && (
                <div>
                    <h4 className="text-2xl font-semibold mt-2 mb-3 text-center ">Trips</h4>

                    {userTrips
                        .map((trip) => (
                            <div key={trip.id} className="border p-4 rounded-md shadow-md mb-4 hover:bg-slate-100">
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

export default ProfileDetails;
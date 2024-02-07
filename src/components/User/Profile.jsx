import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import Loader from '../Loader';
import { logout, setUser } from '../../utils/authSlice';
import SearchUsers from './SearchUser';
import PendingFollowRequests from './PendingFollowRequests';
import TripJoinRequest from './TripJoinRequest';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [displayName, setDisplayName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangeDisplayName = async () => {
    try {
      setLoading(true);

      await updateProfile(auth.currentUser, { displayName });

      dispatch(setUser({
        id: user.id,
        name: displayName,
        email: user.email,
      }));

      setConfirmation('Display name changed successfully!');
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setConfirmation('Password changed successfully!');
      setError(null);
    } catch (error) {
      setError('Enter Correct Password'||error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };

  return (
    <div className="flex gap-2 items-center justify-center h-screen">
      {loading && <Loader />}
      <TripJoinRequest/>
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Hello, {displayName}</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Full Name</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            onClick={handleChangeDisplayName}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Change Display Name'}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Current Password</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">New Password</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Confirm your new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Logging Out...' : 'Logout'}
          </button>
        </div>

        {confirmation && <p className="text-green-500 mt-4">{confirmation}</p>}
        
      </div>
    </div>
  );
};

export default Profile;

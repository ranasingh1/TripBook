import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUser, faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logout, setUser } from '../../../utils/authSlice';
import Loader from '../../Loader';


const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
  
    const [displayName, setDisplayName] = useState(user.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const fadeInUp = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    };
  
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
        setError('Enter Correct Password' || error.message);
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
      <motion.div
        className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-800 via-purple-600 to-purple-500 text-white"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        {loading && <Loader />}
        <motion.div
          className="bg-white p-8 shadow-md rounded-md w-96 mt-4"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl text-black font-semibold mb-4">
            Profile Settings
          </h2>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                className="mt-1 p-2 w-full border rounded-md text-black focus:outline-none focus:border-indigo-400  transition-all duration-300"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <button
                className="absolute right-0 top-6 hover:scale-105 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-blue-600 focus:outline-none"
                onClick={handleChangeDisplayName}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Change'}
              </button>
            </div>
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Current Password
            </label>
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none text-black focus:border-indigo-400  transition-all duration-300"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              New Password
            </label>
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none  focus:border-indigo-400 transition-all duration-300"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Confirm New Password
            </label>
            <input
              type="password"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-indigo-400  transition-all duration-300"
              placeholder="Confirm your new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <motion.button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md mt-2 transition-all duration-300 hover:bg-blue-600 focus:outline-none"
              onClick={handleChangePassword}
              disabled={loading}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </motion.button>
          </div>
  
          <div className="flex justify-end items-center">
            <motion.button
              className="bg-red-500 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-red-600 focus:outline-none"
              onClick={handleLogout}
              disabled={loading}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              {loading ? 'Logging Out...' : 'Logout'}
            </motion.button>
          </div>
  
          {confirmation && <p className="text-green-500 mt-4">
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {confirmation}
          </p>}
        </motion.div>
      </motion.div>
    );
  };


export default Settings
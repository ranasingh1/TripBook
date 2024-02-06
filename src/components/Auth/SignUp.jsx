import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import Loader from '../Loader';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { addDoc, collection } from '@firebase/firestore';

const SignUp = () => {

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistration = async () => {
    try {
      setError(null);

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!email || !password || !confirmPassword || !displayName) {
        setError('Please fill in all fields.');
        return;
      }

      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid, email: userEmail } = userCredential.user;

      await updateProfile(userCredential.user, { displayName });
      const userData = {
        userId: uid,
        name: displayName,
        email: userEmail,
        followers:[],
        following:[],
        pendingFollowRequest:[],
        acceptedFollowRequest:[],
        fcmToken: ''
      }

      const userDoc =  await addDoc(collection(db,'users'),{
        user:userData
      })

      setLoading(false);
      setConfirmation('Registration Successful');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Logo/>
      {loading && <Loader />}
      <div className="bg-white max-sm:mt-24 p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <div className="mb-4">
          {confirmation && <p className="text-green-500 mb-4">{confirmation}</p>}
          <label className="block text-sm font-medium text-gray-600">Full Name</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          className="hover:bg-blue-400 bg-black text-white px-4 py-2 rounded-md w-full"
          onClick={handleRegistration}
        >
          Register
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/signIn" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

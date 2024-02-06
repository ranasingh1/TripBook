import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, requestForToken } from '../../firebase/firebase';
import Loader from '../Loader';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../utils/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../Logo';
import { getMessaging } from 'firebase/messaging';
import { collection, doc, getDocs, query, updateDoc, where } from '@firebase/firestore';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const isAuthenticated = useSelector((store) => store.auth.isAuthenticated);
  console.log(isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  
  const handleSignIn = async () => {
    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      const {uid, displayName, email: userEmail} = userCredential.user;
      dispatch(setUser({
        id:uid,
        name:displayName || 'User',
        email:userEmail|| 'emails',
        
      }))
      // try {
        // Request FCM token
      //   const fcmtoken = await requestForToken();
  
      //   // Update FCM token in the database
      //   const q = query(collection(db, 'users'), where('user.userId', '==', uid));
      //   const querySnapshot = await getDocs(q);
  
      //   if (!querySnapshot.empty) {
      //     await updateDoc(doc(db, 'users', querySnapshot.docs[0].id), {
      //       'user.fcmToken': fcmtoken,
      //     });

      //   } else {
      //     console.error('User not found');
      //   }
      // } catch (tokenError) {
      //   console.error('Error getting FCM token:', tokenError);
      //   // Handle the error or log it as needed
      // }
  
       navigate("/")
      setConfirmation('Login successful!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <Logo/>
      {loading && <Loader />} 
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
        {confirmation ? (
          <p className="text-green-500 mb-4">{confirmation}</p>
        ) : (
          <div>
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
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              className="bg-black hover:bg-blue-400 text-white px-4 py-2 rounded-md w-full"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        )}{!confirmation &&(  <p className="text-sm text-gray-600 mt-4">
        Don't have an account? <Link to="/signUp" className="text-blue-500">Register</Link>
      </p>)}
      
      </div>
    </div>
  );
};

export default SignIn;

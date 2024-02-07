import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const currentUser = useSelector((store) => store.auth.user);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); 

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(
          collection(db, 'users'),
          where('user.name', '>=', debouncedSearchTerm),
          where('user.name', '<=', debouncedSearchTerm + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const results = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data().user;
          if (userData.userId !== currentUser.id) {
            results.push(userData);
          }
        });

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setError('An error occurred while searching users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isInputFocused && debouncedSearchTerm) {
      fetchUsers();
    }
  }, [debouncedSearchTerm, isInputFocused, currentUser.id]);

  const handleBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 600);  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  return (
    <div className="flex max-sm:mt-24 p-8 rounded-md w-96">
      <div className="mb-4 flex items-center h-16 ">
        <input
          type="text"
          className="mt-1 p-2 flex-1 border-2 border-black rounded-md"
          placeholder="Search User"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </div>

      {loading && <Loader />}

      {error && <p className="text-red-500">{error}</p>}

      {isInputFocused && (
        <div className="mt-16 absolute w-60 bg-white rounded">
          {searchResults.length > 0 && (
            <ul>
              {searchResults.map((user) => (
                <Link key={user.userId} to={`/user/${user.userId}`}>
                  <li className="flex items-center justify-between border-b py-2">
                    <span className="pl-6">{user.name}</span>
                  </li>
                </Link>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;

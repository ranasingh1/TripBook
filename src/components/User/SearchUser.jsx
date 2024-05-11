import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Loader from '../Loader';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

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
    <div className={`transition-all duration-300 ${!isInputFocused ? 'w-44' : 'w-[40vw]'} flex max-sm:mt-24 rounded-md pt-2`}>
      <div className="mb-4 flex items-center h-16 w-full">
        <input
          type="text"
          className="mt-1 p-2 flex-1 border-2 border-black rounded-md"
          placeholder="Search User"
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value)
          setSearchResults([])
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </div>

      {loading && <Loader />}

      {error && <p className="text-red-500">{error}</p>}

      {isInputFocused && (
        <div className="mt-14 absolute w-[40vw] rounded-md bg-gray-50 hover:scale-105   transition-all duration-300 transform scale-100">
          {searchResults.length > 0 && (
            <ul className="opacity-100 transition-opacity duration-300 ease-in-out transform scale-100">
              {searchResults.map((user) => (
                <Link key={user.userId} to={`/user/${user.userId} ` } >
                  <li className="flex items-center justify-between border-b py-2 rounded-md mt-1">
                    <span className="p-2 font-bold text-2xl">
                      <FontAwesomeIcon icon={faCircleUser} className='mx-3 h-6 w-6'/>
                      {user.name}
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          )}

          {searchTerm && searchResults.length === 0 && isInputFocused && (
            <p className="opacity-100 p-2 transition-opacity duration-300 ease-in-out">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
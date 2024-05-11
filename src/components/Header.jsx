import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../utils/authSlice';
import { Link } from 'react-router-dom';
import SearchUsers from './User/SearchUser';
import PendingFollowRequests from './User/PendingFollowRequests';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import JoinRequest from './User/JoinRequest';

const Header = () => {
  const user = useSelector((store) => store.auth.user);
  const dropdownRef = useRef(null);

  const [toggle, setToggle] = useState(false);
  const [followrtoggle, setFollowerToggle] = useState(false);
  const [hoverText, setHoverText] = useState('Welcome!');

  const dispatch = useDispatch();

  // To be made dynamic later
  const notificationsCount = 1;

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setToggle(false);
      setFollowerToggle(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex sticky h-20 z-20 top-0 bg-white justify-between items-center shadow-md px-6 transition-all duration-300">
      <div>
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className='md:flex hidden'>
        <SearchUsers />
      </div>
      <div className="flex items-center font-bold text-2xl">
        <div className=' w-64'>
          <h1
            className={` justify-end flex mr-4 transition-all duration-300 transform hover:translate-x-2 cursor-pointer`}
            onMouseEnter={() => setHoverText('Create a Trip')}
            onMouseLeave={() => setHoverText('Welcome!')}
          >
            {hoverText} {user.name}
          </h1>
        </div>
        <button
          onClick={() => {
            setToggle(false);
            setFollowerToggle((prev) => !prev);
          }}
          className="relative h-8 w-8 m-2 focus:outline-none transition-all duration-300 transform hover:scale-110 opacity-80 hover:opacity-100"
        >
          <FontAwesomeIcon icon={faBell} className="h-full w-full" />
          {notificationsCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full px-2">
              {notificationsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setFollowerToggle(false);
            setToggle((prev) => !prev);
          }}
          className="h-8 w-8 m-2 focus:outline-none transition-all duration-300 transform hover:scale-110 opacity-80 hover:opacity-100"
        >
          <FontAwesomeIcon icon={faUser} className="h-full w-full" />
        </button>
      </div>
      {followrtoggle && (
        <div className="absolute right-16 top-[4.45rem] mt-1 flex flex-col gap-2 shadow-md transition-all duration-300" ref={dropdownRef}>
          <PendingFollowRequests />
          <JoinRequest />
        </div>
      )}
      {toggle && (
        <div className="absolute right-6 top-[5.2rem] rounded w-44 flex flex-col bg-white border border-gray-300 p-4 shadow-md transition-all duration-300" ref={dropdownRef}>
          <Link to={`/profile/${user?.id}`}>
            <button className="w-full rounded-lg my-2 py-2 px-4 text-xl text-gray-800 hover:bg-black hover:text-white focus:outline-none transition-all duration-300 transform hover:scale-105">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Profile
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg py-2 px-4 text-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none transition-all duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;

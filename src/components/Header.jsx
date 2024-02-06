import React, { useState } from 'react';
import Logo from './Logo';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../utils/authSlice';
import { Link } from 'react-router-dom';
import SearchUsers from './User/SearchUser';
import PendingFollowRequests from './User/PendingFollowRequests';

const Header = () => {
  const user = useSelector((store) => store.auth.user);
  const [toggle, setToggle] = useState(false);
  const [followrtoggle, setFollowerToggle] =useState(false);

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex sticky h-16 mb-6 z-20 top-0 bg-white justify-between items-center shadow-md px-6">
      <div>
      <Link to ="/" > <Logo /> </Link>
      </div>
      <div>
        <SearchUsers/>
      </div>
      <div className="flex items-center font-bold text-2xl">
        <h1 className="mr-4">Hi! {user.name}</h1>
        <button
          onClick={() => setToggle((prev) => !prev)}
          className="h-8 w-8 m-2 focus:outline-none"
        >
          <img
            src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
            alt="User Avatar"
            className="h-full w-full"
          />
        </button>
        <button
          onClick={() => {
            setToggle(false);
            setFollowerToggle((prev) => !prev)}}
          className="h-8 w-8 m-2 focus:outline-none"
        >
          <img
            src="data:image/png;base64,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"
            alt="User Avatar"
            className="h-full w-full"
          />
        </button>
      </div>
      {followrtoggle && (
                <div className="absolute right-6 top-16 rounded  flex flex-col bg-white border border-gray-300 p-4 shadow-md">

      <PendingFollowRequests/>
      </div>)}
      {toggle && (
        <div className="absolute right-16 top-16 rounded w-44 flex flex-col bg-white border border-gray-300 p-4 shadow-md">
          <Link to="/profile">
            <button className="w-full rounded-lg my-2 py-2 px-4 text-xl text-gray-800 hover:bg-gray-100 focus:outline-none">
              Profile
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg py-2 px-4 text-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 focus:outline-none"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;

import React, { useState } from 'react';
import ProfileDetails from './modules/ProfileDetails';
import Settings from './modules/Settings';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="mx-12 p-4">
      <ul className="flex border-b p-2 justify-center">
        <li
          className={`mr-6 cursor-pointer ${
            activeTab === 'profile' ? 'border-b-2 border-blue-500' : ''
          }`}
          onClick={() => handleTabClick('profile')}
        >
          Profile
        </li>
        <li
          className={`mr-6 cursor-pointer ${
            activeTab === 'settings' ? 'border-b-2 border-blue-500' : ''
          }`}
          onClick={() => handleTabClick('settings')}
        >
          Settings
        </li>
      </ul>
      <div className="mt-4">
        {activeTab === 'profile' && <div><ProfileDetails/></div>}
        {activeTab === 'settings' && <div><Settings/></div>}
      </div>
    </div>
  );
};

export default Profile;

import React from 'react'
import TripCreation from '../trip/TripCreation'
import EditTrips from '../trip/EditTrips'
import UserTrips from '../User/UserTrips'

const Home = () => {
  return (
    <div className=' flex flex-wrap w-full'>
     <div className=' w-1/2 '>
        <TripCreation/>
     </div>
     <div className=' flex  w-1/2 flex-col flex-1'>
       <UserTrips/>
      <EditTrips/>
     </div>
    </div>
  )
}

export default Home
import React from 'react'
import { formatDate } from '../../../utils/helpers/formatDate'

const ActivitiesCard = ({activities}) => {
  return (
    <>
    <div className=' border rounded   w-64  text-sm font-semibold p-2 shadow hover:bg-slate-100 '>
      <div className=' text-center w-full'>
           <h3>{activities?.title}</h3>
      </div>
       <div className='my-2 gap-2 flex jutify-between'>
         <h3 className='flex'><span>Date: </span> {formatDate(activities?.date)}  </h3>
         <h3 className='  flex  '><span>Location: {" "}</span>  {activities?.location}  </h3>

       </div>

       
    <h3 className=' text-wrap'><span>Details:</span> {activities?.description}  </h3>

    </div>
    </>

  )
}

export default ActivitiesCard
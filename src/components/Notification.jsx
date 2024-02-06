import React, { useEffect, useState } from 'react'
import toast, {Toaster} from 'react-hot-toast'
import { onMessageListener, requestForToken } from '../firebase/firebase'
const Notification = () => {
    const [notification, setNotification] = useState({title:"", body:""})
    const notify = ()=>toast(<ToastDisplay/>)
    requestForToken();
   
    useEffect(()=>{
        notify();
    },[notification])

  const ToastDisplay = ()=>{
    return(
        <div>
            <p>{notification?.title}</p>
            <p>{notification?.body}</p>

            
        </div>
    )
  }  

  onMessageListener().then((payload)=>{
        setNotification({title:payload?.notification?.title, body:payload?.notification.body})
  }).catch((err)=>{
      console.log('onMessageListener', err)
  })
  return <Toaster/>
  }

export default Notification
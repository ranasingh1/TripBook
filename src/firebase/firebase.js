import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyB_xhyQ4J2nzO9CJThnEKN-cdbbNPNvaKo",
  authDomain: "travel-planner-8f6ce.firebaseapp.com",
  projectId: "travel-planner-8f6ce",
  storageBucket: "travel-planner-8f6ce.appspot.com",
  messagingSenderId: "839704784423",
  appId: "1:839704784423:web:b6be981a16f0c70f01a802",
  measurementId: "G-51H2LZ0GDN"
};

export const app = initializeApp(firebaseConfig);

const db  = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);
export const requestForToken = async()=>{
  return getToken(messaging, {
    vapidKey:"BFJDWb8xVsVX2rPfYxP8gZVYk0dwqyDHTu9bgkoAoeyFH8fG7q8QXT_FU0rJJyvol4kld91gKNFiF6LkmK9uG0o"
  }).then((currentToken)=>{
    if(currentToken){
    console.log("Token Client:", currentToken);
    return currentToken;
    }else{
      console.log("No registration token available");
    }
  }).catch((err)=>{
    console.log('Error while Registering token', err);
  })
}

export const onMessageListener = ()=>{
  return new Promise((resolve)=>{
    onMessage(messaging,(payload) => {
      console.log("OnMessage Payload", payload);
      resolve(payload);
    })
  })
}
export{auth, db};
export default app; 

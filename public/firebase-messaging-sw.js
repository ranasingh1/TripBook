
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

const firebaseConfig = {
    apiKey: "AIzaSyB_xhyQ4J2nzO9CJThnEKN-cdbbNPNvaKo",
    authDomain: "travel-planner-8f6ce.firebaseapp.com",
    projectId: "travel-planner-8f6ce",
    storageBucket: "travel-planner-8f6ce.appspot.com",
    messagingSenderId: "839704784423",
    appId: "1:839704784423:web:b6be981a16f0c70f01a802",
    measurementId: "G-51H2LZ0GDN"
  };
  
firebase.initializeApp(firebaseConfig);

const messaging =firebase.messaging();

 messaging.onBackgroundMessage(function(payload){
    console.log('Recieved Background Message', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions={
        body:payload.notification.body,
    }
    self.registration.showNotification(notificationTitle, notificationOptions);
 })
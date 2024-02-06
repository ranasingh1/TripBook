import { createBrowserRouter } from "react-router-dom";
import SignIn from "../components/Auth/SignIn";
import SignUp from "../components/Auth/SignUp";
import Profile from "../components/User/Profile";
import PrivateRoute from "./PrivateRoute";
import SearchUserProfile from "../components/User/SearchUserProfile";
import Layout from "../layout/Layout"
import TripCreation from "../components/trip/TripCreation";
export const router = createBrowserRouter([
    {
         path:"/",
         element: <PrivateRoute children={<Layout/>}/>,
         children:[
            {
                path:"/",
                element:<TripCreation/>
            },
            {
      
                path :'profile',
                element:<PrivateRoute children={<Profile/>}/>
               }
               , {
                path:"/user/:userId",
                element:<PrivateRoute children={<SearchUserProfile/>}/>
           },
          
         ]
    }, 
    
    ,
    {
        path:"/signUp",
        element:<SignUp/>
    },
    {
    path: "/signIn",
    element:<SignIn/>
 }])
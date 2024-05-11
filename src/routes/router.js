import { createBrowserRouter } from "react-router-dom";
import SignIn from "../components/Auth/SignIn";
import SignUp from "../components/Auth/SignUp";
import PrivateRoute from "./PrivateRoute";
import SearchUserProfile from "../components/User/SearchUserProfile";
import Layout from "../layout/Layout"
import TripCreation from "../components/trip/TripCreation";
import Home from "../components/Home/Home";
import Profile from "../components/Profile/Profile";
export const router = createBrowserRouter([
    {
         path:"/",
         element: <PrivateRoute children={<Layout/>}/>,
         children:[
            {
                path:"/",
                element:<Home/>
            },
            {
      
                path :'profile/:userId',
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
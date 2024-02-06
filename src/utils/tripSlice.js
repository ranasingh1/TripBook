import { createSlice } from "@reduxjs/toolkit";
const loadTripFromStorage = () => {
    const storedTrip = localStorage.getItem("trip");
    return storedTrip ? JSON.parse(storedTrip) : null;
  };
  

const tripSlice = createSlice({
    name: "trip",
    initialState:loadTripFromStorage(),
    reducers:{
        
    }

})
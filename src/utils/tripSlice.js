import { createSlice } from "@reduxjs/toolkit";
  

const tripSlice = createSlice({
    name: "trip",
    initialState:'false',
    reducers:{
      stateChange: (state, action) => !state

    }

})


export const { stateChange } = tripSlice.actions;
export default tripSlice.reducer;

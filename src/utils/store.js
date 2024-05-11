import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import tripSlice from "./tripSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        trip:tripSlice
    }
})

export default store;
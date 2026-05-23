import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import managementReducer from "./managementSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    management: managementReducer,
  },
});

export default store;

import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/productSlice';
import cartReducer from '../features/cartSlice';
import { thunk } from "redux-thunk";


export const store = configureStore({

    reducer:{
        products: productsReducer,
        cart: cartReducer,
    },

    /* middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(), */

});
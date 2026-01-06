import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import { getAllProducts , deleteProduct } from "../services/api";

//Fetch products from API

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () =>{
    const res = await getAllProducts();
    return  res.data;
   
});

//Delete Product by ID

export const removeProducts = createAsyncThunk('products/removeProduct', async() => {
await deleteProduct(id);
return id;
});

const productSlice = createSlice({
    name:'products',
    initialState:{
        products: [],
        loading: false,
        error: null,
        searchQuery:'',
        selectedCategory: ''
    },

    reducers:{
        setSearchQuery: (state , action)=>{
            state.searchQuery = action.payload;
        },
        setSelectedCategory: (state , action)=>{
            state.selectedCategory = action.payload;
        },
    },

    extraReducers: (builder)=>{
        builder

        .addCase(fetchProducts.pending , (state)=>{
            state.loading= true;
        })

        .addCase(fetchProducts.fulfilled, (state , action)=>{
            state.loading= false;
            state.products= action.payload;
        })

        .addCase(fetchProducts.rejected , (state , action)=>{
            state.loading= false;
            state.error = action.error.message;
        })

        .addCase(removeProducts.fulfilled , (state, action)=>{
            state.products = state.products.filter(p=> p._id !== action.payload);
        });

    }
});

export const {setSearchQuery , setSelectedCategory} = productSlice.actions;

export default productSlice.reducer;
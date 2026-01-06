import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    appliedCoupon: null,
    savedForLater: [],
    recentlyRemoved: null,
    lastUpdated: null,
    isLoading: false,
    counter:0,
    error: null,
    
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,

    reducers: {
        // Add item to cart with advanced logic
        addToCart: (state, action) => {
            const newItem = action.payload;
            const existingItemIndex = state.cartItems.findIndex(
                item => item._id === newItem._id && 
                item.size === newItem.size && 
                item.color === newItem.color
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                const existingItem = state.cartItems[existingItemIndex];
                const newQuantity = existingItem.quantity + (newItem.quantity || 1);
                
                // Check stock limit
                if (newItem.stock && newQuantity > newItem.stock) {
                    state.error = `Only ${newItem.stock} items available in stock`;
                    return;
                }
                
                existingItem.quantity = newQuantity;
                existingItem.totalPrice = existingItem.finalPrice * newQuantity;
            } else {
                // Add new item
                const cartItem = {
                    ...newItem,
                    quantity: newItem.quantity || 1,
                    totalPrice: newItem.finalPrice * (newItem.quantity || 1),
                    addedAt: new Date().toISOString(),
                    cartItemId: `${newItem._id}_${newItem.size}_${newItem.color}_${Date.now()}`
                };
                state.counter+=1;
                state.cartItems.push(cartItem);
            }

            state.lastUpdated = new Date().toISOString();
            state.error = null;
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Update item quantity
        updateCartQuantity: (state, action) => {
            const { id, quantity, size, color } = action.payload;
            const itemIndex = state.cartItems.findIndex(
                item => item._id === id && 
                (!size || item.size === size) && 
                (!color || item.color === color)
            );

            if (itemIndex !== -1) {
                const item = state.cartItems[itemIndex];
                
                // Validate quantity
                if (quantity <= 0) {
                    state.cartItems.splice(itemIndex, 1);
                } else if (item.stock && quantity > item.stock) {
                    state.error = `Only ${item.stock} items available in stock`;
                    return;
                } else {
                    item.quantity = quantity;
                    item.totalPrice = item.finalPrice * quantity;
                }
                
                state.lastUpdated = new Date().toISOString();
                state.error = null;
                cartSlice.caseReducers.calculateTotals(state);
            }
        },

        // Remove item from cart
        removeFromCart: (state, action) => {
            const { id, size} = action.payload;
            const itemIndex = state.cartItems.findIndex(
                item => item._id === id && 
                (!size || item.size === size)
            );

            if (itemIndex !== -1) {
                const removedItem = state.cartItems[itemIndex];
                state.recentlyRemoved = {
                    ...removedItem,
                    removedAt: new Date().toISOString()
                };
                state.cartItems.splice(itemIndex, 1);
                state.lastUpdated = new Date().toISOString();
                state.counter-=1;
                cartSlice.caseReducers.calculateTotals(state);
            }
        },

        // Restore recently removed item
        restoreRemovedItem: (state) => {
            if (state.recentlyRemoved) {
                const { removedAt, ...item } = state.recentlyRemoved;
                state.cartItems.push(item);
                state.recentlyRemoved = null;
                state.lastUpdated = new Date().toISOString();
                cartSlice.caseReducers.calculateTotals(state);
            }
        },

        // Move item to saved for later
        moveToSavedForLater: (state, action) => {
            const { id, size, color } = action.payload;
            const itemIndex = state.cartItems.findIndex(
                item => item._id === id && 
                (!size || item.size === size) && 
                (!color || item.color === color)
            );

            if (itemIndex !== -1) {
                const item = state.cartItems[itemIndex];
                state.savedForLater.push({
                    ...item,
                    savedAt: new Date().toISOString()
                });
                state.cartItems.splice(itemIndex, 1);
                state.lastUpdated = new Date().toISOString();
                cartSlice.caseReducers.calculateTotals(state);
            }
        },

        // Move from saved for later to cart
        moveToCart: (state, action) => {
            const { id, size, color } = action.payload;
            const itemIndex = state.savedForLater.findIndex(
                item => item._id === id && 
                (!size || item.size === size) && 
                (!color || item.color === color)
            );

            if (itemIndex !== -1) {
                const { savedAt, ...item } = state.savedForLater[itemIndex];
                state.cartItems.push(item);
                state.savedForLater.splice(itemIndex, 1);
                state.lastUpdated = new Date().toISOString();
                cartSlice.caseReducers.calculateTotals(state);
            }
        },

        // Remove from saved for later
        removeFromSavedForLater: (state, action) => {
            const { id, size, color } = action.payload;
            state.savedForLater = state.savedForLater.filter(
                item => !(item._id === id && 
                (!size || item.size === size) && 
                (!color || item.color === color))
            );
        },

        // Apply coupon code
        applyCoupon: (state, action) => {
            const coupon = action.payload;
            
            // Validate coupon
            if (!coupon || !coupon.code) {
                state.error = "Invalid coupon code";
                return;
            }

            // Check minimum purchase requirement
            if (coupon.minimumPurchase && state.subtotal < coupon.minimumPurchase) {
                state.error = `Minimum purchase of $${coupon.minimumPurchase} required`;
                return;
            }

            // Apply coupon
            state.appliedCoupon = coupon;
            state.error = null;
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Remove coupon
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Update shipping method
        updateShipping: (state, action) => {
            const shippingMethod = action.payload;
            state.shipping = shippingMethod.cost || 0;
            state.lastUpdated = new Date().toISOString();
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Clear entire cart
        clearCart: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
            state.totalItems = 0;
            state.subtotal = 0;
            state.discount = 0;
            state.shipping = 0;
            state.appliedCoupon = null;
            state.recentlyRemoved = null;
            state.lastUpdated = new Date().toISOString();
            state.error = null;
        },

        // Merge guest cart with user cart (for login)
        mergeCart: (state, action) => {
            const userCart = action.payload;
            
            userCart.forEach(userItem => {
                const existingIndex = state.cartItems.findIndex(
                    item => item._id === userItem._id && 
                    item.size === userItem.size && 
                    item.color === userItem.color
                );

                if (existingIndex !== -1) {
                    // Merge quantities
                    state.cartItems[existingIndex].quantity += userItem.quantity;
                    state.cartItems[existingIndex].totalPrice = 
                        state.cartItems[existingIndex].finalPrice * 
                        state.cartItems[existingIndex].quantity;
                } else {
                    // Add new item
                    state.cartItems.push(userItem);
                }
            });

            state.lastUpdated = new Date().toISOString();
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Sync cart with backend
        syncCart: (state, action) => {
            state.cartItems = action.payload.items || [];
            state.appliedCoupon = action.payload.coupon || null;
            state.lastUpdated = new Date().toISOString();
            cartSlice.caseReducers.calculateTotals(state);
        },

        // Update cart loading state
        setCartLoading: (state, action) => {
            state.isLoading = action.payload;
        },

        // Set cart error
        setCartError: (state, action) => {
            state.error = action.payload;
        },

        // Calculate all totals
        calculateTotals: (state) => {
            // Calculate subtotal
            state.subtotal = state.cartItems.reduce(
                (sum, item) => sum + (item.finalPrice * item.quantity), 
                0
            );

            // Calculate total items
            state.totalItems = state.cartItems.reduce(
                (sum, item) => sum + item.quantity, 
                0
            );

            // Calculate discount
            state.discount = 0;
            if (state.appliedCoupon) {
                if (state.appliedCoupon.type === 'percentage') {
                    state.discount = (state.subtotal * state.appliedCoupon.value) / 100;
                    // Apply maximum discount limit if exists
                    if (state.appliedCoupon.maxDiscount) {
                        state.discount = Math.min(state.discount, state.appliedCoupon.maxDiscount);
                    }
                } else if (state.appliedCoupon.type === 'fixed') {
                    state.discount = Math.min(state.appliedCoupon.value, state.subtotal);
                }
            }


            // Free shipping threshold
            const FREE_SHIPPING_THRESHOLD = 100;
            if (state.subtotal >= FREE_SHIPPING_THRESHOLD) {
                state.shipping = 0;
            } else if (state.shipping === 0) {
                // Default shipping if not set
                state.shipping = 10;
            }

            // Calculate total
            state.totalAmount = state.subtotal - state.discount + state.shipping;
            
            // Round to 2 decimal places
            state.subtotal = Math.round(state.subtotal * 100) / 100;
            state.discount = Math.round(state.discount * 100) / 100;
            state.totalAmount = Math.round(state.totalAmount * 100) / 100;
        },

        // Validate cart items (check stock, prices, etc.)
        validateCart: (state, action) => {
            const updatedProducts = action.payload;
            
            state.cartItems = state.cartItems.map(item => {
                const updatedProduct = updatedProducts.find(p => p._id === item._id);
                
                if (updatedProduct) {
                    // Update price if changed
                    if (updatedProduct.finalPrice !== item.finalPrice) {
                        item.priceChanged = true;
                        item.oldPrice = item.finalPrice;
                        item.finalPrice = updatedProduct.finalPrice;
                        item.price = updatedProduct.price;
                    }
                    
                    // Check stock
                    if (updatedProduct.stock < item.quantity) {
                        item.stockIssue = true;
                        item.availableStock = updatedProduct.stock;
                    }
                    
                    // Check if product is still available
                    item.isAvailable = updatedProduct.isAvailable;
                }
                
                return item;
            });

            cartSlice.caseReducers.calculateTotals(state);
        },
    },
});

// Export actions
export const {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    restoreRemovedItem,
    moveToSavedForLater,
    moveToCart,
    removeFromSavedForLater,
    applyCoupon,
    removeCoupon,
    updateShipping,
    clearCart,
    mergeCart,
    syncCart,
    setCartLoading,
    setCartError,
    calculateTotals,
    validateCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartItemsCount = (state) => state.cart.totalItems;
export const selectSavedForLater = (state) => state.cart.savedForLater;
export const selectCartSummary = (state) => ({
    subtotal: state.cart.subtotal,
    discount: state.cart.discount,
    shipping: state.cart.shipping,
    total: state.cart.totalAmount,
    appliedCoupon: state.cart.appliedCoupon,
});

export default cartSlice.reducer;
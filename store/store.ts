
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { CartItem } from './cartSlice';

// Helper function to safely get item from localStorage
const getInitialCartState = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const persistedState = localStorage.getItem('cart-storage');
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState);
        // Basic validation: Check if it's an array
        if (Array.isArray(parsedState)) {
           // Further validation could be added here to check item structure
           return parsedState;
        }
      } catch (e) {
        console.error("Failed to parse cart state from localStorage", e);
      }
    }
  }
  return []; 
};


export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  // Load initial state safely
  preloadedState: {
    cart: { items: getInitialCartState() }
  }
});

// Subscribe to store changes and persist to localStorage
store.subscribe(() => {
  if (typeof window !== 'undefined') {
     try {
       const cartItems = store.getState().cart.items;
       localStorage.setItem('cart-storage', JSON.stringify(cartItems));
     } catch (e) {
       console.error("Could not save cart state to localStorage", e);
     }
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
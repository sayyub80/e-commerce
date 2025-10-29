
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '@/types';

export interface CartItem extends IProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
  // We'll load persisted state later if it exists
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCartState: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<{ product: IProduct; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item._id === product._id);

      if (existingItemIndex > -1) {
        const existingItem = state.items[existingItemIndex];
        // Ensure we don't exceed inventory
        const newQuantity = Math.min(existingItem.quantity + quantity, product.inventory);
        if (newQuantity > existingItem.quantity) { // Only update if quantity increases or stays same but within bounds
           state.items[existingItemIndex].quantity = newQuantity;
        }
      } else {
         // Ensure we don't add more than inventory allows and quantity > 0
         const clampedQuantity = Math.min(Math.max(1, quantity), product.inventory);
         if (clampedQuantity > 0 && product.inventory > 0) {
            state.items.push({ ...product, quantity: clampedQuantity });
         }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item._id === productId);

      if (itemIndex > -1) {
         // Clamp quantity between 1 and inventory
         const inventory = state.items[itemIndex].inventory;
         const newQuantity = Math.max(1, Math.min(quantity, inventory));
         state.items[itemIndex].quantity = newQuantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, loadCartState } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTotalItems = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectTotalPrice = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export default cartSlice.reducer;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  minPartQuantity: number;
  minQuantity: number;
  imageUrl: string;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  countItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find((i) => i.productId === item.productId);

        let updatedCart;
        if (existing) {
          updatedCart = cart.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
          );
        } else {
          updatedCart = [...cart, item];
        }

        set({ cart: updatedCart });
      },

      removeFromCart: (productId) => {
        const filtered = get().cart.filter((i) => i.productId !== productId);
        set({ cart: filtered });
      },

      updateItemQuantity: (productId, quantity) => {
        const cart = get().cart;

        const updatedCart = cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        );

        set({ cart: updatedCart });
      },

      clearCart: () => set({ cart: [] }),

      totalItems: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      countItems: () => get().cart.length,

      totalPrice: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage', // ключ у localStorage
      partialize: (state) => ({ cart: state.cart }), // зберігати тільки `cart`, без функцій
    },
  ),
);

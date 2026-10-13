import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Api } from '@/services/api-client';

export type FullCartItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  minPartQuantity: number;
  minQuantity: number;
  quantity: number;
};

export const useCartProducts = () => {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart); // 👈 додамо видалення
  const [products, setProducts] = useState<FullCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ids = cart.map((i) => i.productId);
        const data = await Api.products.getByIds(ids);

        // Перевіряємо які id реально є в базі
        const foundIds = data.map((p: any) => p.id);

        // Якщо щось у корзині, а в базі цього вже нема — чистимо
        cart.forEach((item) => {
          if (!foundIds.includes(item.productId)) {
            removeFromCart(item.productId);
          }
        });

        // Об'єднуємо кількість з корзини та дані з сервера
        const merged = data.map((product: any) => {
          const cartItem = cart.find((c) => c.productId === product.id)!;
          return {
            ...product,
            quantity: cartItem.quantity,
          };
        });

        setProducts(merged);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cart, removeFromCart]);

  const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { products, totalPrice, loading };
};

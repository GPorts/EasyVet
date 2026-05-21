import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

/**
 * Hook for sales / PDV management
 */
export function useSales() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);

  // Load sales history
  const loadSales = useCallback(async (limit = 50) => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('clinic_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      setSales(data || []);
      return data || [];
    } catch (err) {
      console.error('Error loading sales:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Finalize a sale: save to history + deduct stock
  const finalizeSale = useCallback(async (cartItems, paymentMethod = 'cash', notes = '') => {
    if (!user) throw new Error('User not authenticated');
    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');

    setLoading(true);
    try {
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

      // 1. Save sale record
      const saleItems = cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        category: item.category,
        qty: item.qty,
        unitPrice: item.price,
        subtotal: item.price * item.qty,
      }));

      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          clinic_id: user.id,
          items: saleItems,
          total,
          payment_method: paymentMethod,
          notes,
        });

      if (saleError) throw saleError;

      // 2. Deduct stock for each item
      for (const item of cartItems) {
        const newQty = Math.max(0, (item.currentQty || 0) - item.qty);
        const { error: stockError } = await supabase
          .from('products')
          .update({ currentQty: newQty })
          .eq('clinic_id', user.id)
          .eq('id', item.id);

        if (stockError) {
          console.error(`Error updating stock for ${item.name}:`, stockError);
        }
      }

      // 3. The real-time subscription in DataContext will automatically
      //    refresh the products cache when stock changes are detected.
      //    Calling refreshProducts() manually here would cause a race
      //    condition with the subscription, resulting in NetworkError.

      return { success: true, total };
    } catch (err) {
      console.error('Error finalizing sale:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get today's sales summary
  const getTodaySummary = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.created_at?.startsWith(today));
    return {
      count: todaySales.length,
      total: todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0),
    };
  }, [sales]);

  return {
    sales,
    loading,
    loadSales,
    finalizeSale,
    getTodaySummary,
  };
}

import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { differenceInDays } from 'date-fns';

/**
 * Hook for inventory/product management - uses global cache
 */
export function useInventory() {
  const { user } = useAuth();
  const { products, refreshProducts, initialLoading } = useData();

  const loadProducts = useCallback(async () => {
    return await refreshProducts();
  }, [refreshProducts]);

  const createProduct = useCallback(async (data) => {
    if (!user) throw new Error('User not authenticated');
    const { data: inserted, error } = await supabase
      .from('products')
      .insert({ ...data, clinic_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await refreshProducts();
    return inserted;
  }, [user, refreshProducts]);

  const updateProduct = useCallback(async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    // eslint-disable-next-line no-unused-vars
    const { id: _, ...updateData } = data;
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
    await refreshProducts();
  }, [user, refreshProducts]);

  const deleteProduct = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
    await refreshProducts();
  }, [user, refreshProducts]);

  // Quick sale - decrease stock
  const quickSale = useCallback(async (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    const newQty = Math.max(0, (product.currentQty || 0) - quantity);
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('products')
      .update({ currentQty: newQty })
      .eq('clinic_id', user.id)
      .eq('id', productId);
    if (error) throw error;
    await refreshProducts();
    return newQty;
  }, [products, user, refreshProducts]);

  // Get low stock products
  const getLowStockProducts = useCallback(() => {
    return products.filter(p => (p.currentQty || 0) <= (p.minStock || 0));
  }, [products]);

  // Get expiring products (within N days)
  const getExpiringProducts = useCallback((days = 30) => {
    const now = new Date();
    return products.filter(p => {
      if (!p.expirationDate) return false;
      const expDate = new Date(p.expirationDate);
      const diff = differenceInDays(expDate, now);
      return diff >= 0 && diff <= days;
    });
  }, [products]);

  // Get expired products
  const getExpiredProducts = useCallback(() => {
    const now = new Date();
    return products.filter(p => {
      if (!p.expirationDate) return false;
      return new Date(p.expirationDate) < now;
    });
  }, [products]);

  const searchProducts = useCallback((searchTerm) => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }, [products]);

  return {
    products,
    loading: initialLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    quickSale,
    getLowStockProducts,
    getExpiringProducts,
    getExpiredProducts,
    searchProducts,
  };
}

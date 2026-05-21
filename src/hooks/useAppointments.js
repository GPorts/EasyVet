import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { endOfMonth, format } from 'date-fns';

/**
 * Hook for appointment management - uses global cache
 */
export function useAppointments() {
  const { user } = useAuth();
  const { appointments, refreshAppointments, initialLoading } = useData();
  const [loading, setLoading] = useState(false);

  // Compute today's appointments from cache (no async call needed!)
  const todayAppointments = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === today);
  }, [appointments]);

  // Load all appointments (just refreshes cache)
  const loadAppointments = useCallback(async () => {
    return await refreshAppointments();
  }, [refreshAppointments]);

  // Get today's appointments (from cache, no network call)
  const getTodayAppointments = useCallback(async () => {
    return todayAppointments;
  }, [todayAppointments]);

  // Get appointments by date range (from cache)
  const getByDateRange = useCallback((start, end) => {
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date >= startStr && apt.date <= endStr);
  }, [appointments]);

  // Get appointments for a specific month (from cache)
  const getByMonth = useCallback((year, month) => {
    const monthStart = format(new Date(year, month, 1), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date(year, month, 1)), 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date >= monthStart && apt.date <= monthEnd);
  }, [appointments]);

  const createAppointment = useCallback(async (data) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const { data: inserted, error } = await supabase
        .from('appointments')
        .insert({
          ...data,
          clinic_id: user.id,
          status: data.status || 'pending',
          source: data.source || 'internal',
        })
        .select()
        .single();
      if (error) throw error;
      return inserted;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStatus = useCallback(async (id, status) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('clinic_id', user.id)
        .eq('id', id);
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAppointment = useCallback(async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { id: _, ...updateData } = data;
      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('clinic_id', user.id)
        .eq('id', id);
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteAppointment = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('clinic_id', user.id)
        .eq('id', id);
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Count by status
  const countByStatus = useCallback((appointmentsList) => {
    return appointmentsList.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  return {
    appointments,
    todayAppointments,
    loading: loading || initialLoading,
    loadAppointments,
    getTodayAppointments,
    getByDateRange,
    getByMonth,
    createAppointment,
    updateStatus,
    updateAppointment,
    deleteAppointment,
    countByStatus,
  };
}

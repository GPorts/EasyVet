import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Supabase Storage hook for file uploads/downloads
 */
export function useStorage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, path) => {
    if (!user) throw new Error('User not authenticated');
    
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const fullPath = `${user.id}/${path}`;
      
      const { error: err } = await supabase.storage
        .from('clinics_storage')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (err) throw err;
      setProgress(100);
      
      const { data: publicUrlData } = supabase.storage
        .from('clinics_storage')
        .getPublicUrl(fullPath);
        
      return publicUrlData.publicUrl;
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [user]);

  const uploadPetPhoto = useCallback(async (petId, file) => {
    const extension = file.name.split('.').pop();
    const path = `pets/${petId}/photo_${Date.now()}.${extension}`;
    return upload(file, path);
  }, [upload]);

  const uploadMedicalFile = useCallback(async (petId, file) => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `pets/${petId}/records/${timestamp}_${safeName}`;
    return upload(file, path);
  }, [upload]);

  const deleteFile = useCallback(async (fileUrl) => {
    try {
      // Very naive extraction of the path from the public URL
      const path = fileUrl.split('/clinics_storage/')[1];
      if (path) {
        const { error } = await supabase.storage
          .from('clinics_storage')
          .remove([path]);
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error('Delete file error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    upload,
    uploadPetPhoto,
    uploadMedicalFile,
    deleteFile,
    uploading,
    progress,
    error,
  };
}

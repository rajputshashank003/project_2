import { useState, useEffect, useCallback } from 'react';
import { getGalleryImages } from '../../utils/api_request/gallery';
import type { GalleryImage } from '../../types/ngo';

export const useGallery = () => {
  const [images, setImages]           = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getGalleryImages(1, 100);
      setImages(res.data);
    } catch {
      // error toast handled by axiosInstance interceptor
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    isLoading,
    activeImage,
    setActiveImage,
    refresh: fetchImages,
  };
};

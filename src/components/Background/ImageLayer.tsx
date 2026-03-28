import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../store/useSettings';
import type { BackgroundCategory } from '../../types';

const UNSPLASH_COLLECTIONS: Record<BackgroundCategory, string[]> = {
  nature: ['1163637', '3330452', '1580890'],
  minimal: ['2898186', '3656621', '1103088'],
  lofi: ['4468315', '2896407', '3348849'],
  abstract: ['1475145', '3178572', '1535800'],
};

interface UnsplashImage {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

export function ImageLayer() {
  const backgroundCategory = useSettings((s) => s.backgroundCategory);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchImages = useCallback(async (category: BackgroundCategory) => {
    setLoading(true);
    setImageLoaded(false);

    const collectionId =
      UNSPLASH_COLLECTIONS[category][
        Math.floor(Math.random() * UNSPLASH_COLLECTIONS[category].length)
      ];

    try {
      const response = await fetch(
        `https://api.unsplash.com/collections/${collectionId}/photos?per_page=10&order_by=popular`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ''}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const fetchedImages: UnsplashImage[] = data.map((photo: { urls: { regular: string }; alt_description: string; user: { name: string; links: { html: string } } }) => ({
        url: photo.urls.regular,
        alt: photo.alt_description || 'Background image',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
      }));

      setImages(fetchedImages);
      setCurrentIndex(0);
    } catch {
      setImages(getFallbackImages(category));
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(backgroundCategory);
  }, [backgroundCategory, fetchImages]);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 120000);
    return () => clearInterval(interval);
  }, [images.length]);

  const currentImage = images[currentIndex];

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="wait">
        {currentImage && (
          <motion.div
            key={currentImage.url}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              crossOrigin="anonymous"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/25 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-[2]" />

      {loading && (
        <div className="absolute inset-0 z-[3] flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {currentImage && !loading && (
        <div className="absolute bottom-4 right-4 z-[10]">
          <p className="text-white/30 text-[10px]">
            Photo by{' '}
            <a
              href={`${currentImage.photographerUrl}?utm_source=tasty-pomodoro&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/50 transition-colors"
            >
              {currentImage.photographer}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

function getFallbackImages(category: BackgroundCategory): UnsplashImage[] {
  const fallbackUrls: Record<BackgroundCategory, string[]> = {
    nature: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
    ],
    minimal: [
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1920&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80',
    ],
    lofi: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    ],
    abstract: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
    ],
  };

  return (fallbackUrls[category] || fallbackUrls.nature).map((url) => ({
    url,
    alt: `${category} background`,
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
  }));
}

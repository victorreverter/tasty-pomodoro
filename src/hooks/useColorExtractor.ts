import { useState, useEffect, useRef } from 'react';

export function useColorExtractor(imageUrl: string) {
  const [dominantColor, setDominantColor] = useState<string>('rgba(100, 100, 120, 0.6)');
  const [isDark, setIsDark] = useState(true);
  const prevUrlRef = useRef<string>('');

  useEffect(() => {
    if (!imageUrl || imageUrl === prevUrlRef.current) return;
    prevUrlRef.current = imageUrl;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const extract = async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });

        if (cancelled) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let r = 0, g = 0, b = 0;
        const pixels = sampleSize * sampleSize;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        r = Math.round(r / pixels);
        g = Math.round(g / pixels);
        b = Math.round(b / pixels);

        if (!cancelled) {
          setDominantColor(`rgba(${r}, ${g}, ${b}, 0.6)`);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setIsDark(luminance < 0.5);

          document.documentElement.style.setProperty('--accent-r', String(r));
          document.documentElement.style.setProperty('--accent-g', String(g));
          document.documentElement.style.setProperty('--accent-b', String(b));
        }
      } catch {
        if (!cancelled) {
          setDominantColor('rgba(100, 100, 120, 0.6)');
          setIsDark(true);
        }
      }
    };

    extract();
    return () => { cancelled = true; };
  }, [imageUrl]);

  return { dominantColor, isDark };
}

import { useState, useEffect } from 'react';
import { transformImg } from '../lib/img';

const colorCache = new Map<string, string>();
const FALLBACK = '#f9f9f9';

function sampleImageColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const samplerSrc = transformImg(src, 'f_auto,q_auto,w_50,h_50,c_fill');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => resolve(FALLBACK);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 50, 50);
        const corners = [
          ctx.getImageData(0, 0, 5, 5),
          ctx.getImageData(45, 0, 5, 5),
          ctx.getImageData(0, 45, 5, 5),
          ctx.getImageData(45, 45, 5, 5),
        ];
        let r = 0, g = 0, b = 0, count = 0;
        for (const d of corners) {
          for (let i = 0; i < d.data.length; i += 4) {
            r += d.data[i];
            g += d.data[i + 1];
            b += d.data[i + 2];
            count++;
          }
        }
        const hex = (n: number) => Math.round(n / count).toString(16).padStart(2, '0');
        resolve(`#${hex(r)}${hex(g)}${hex(b)}`);
      } catch {
        resolve(FALLBACK);
      }
    };
    img.src = samplerSrc;
  });
}

export function useImageBackgroundColor(src: string): { bgColor: string } {
  const [bgColor, setBgColor] = useState<string>(() => colorCache.get(src) ?? FALLBACK);

  useEffect(() => {
    if (!src) return;
    if (colorCache.has(src)) {
      setBgColor(colorCache.get(src)!);
      return;
    }
    let cancelled = false;
    sampleImageColor(src).then((color) => {
      if (cancelled) return;
      colorCache.set(src, color);
      setBgColor(color);
    });
    return () => { cancelled = true; };
  }, [src]);

  return { bgColor };
}

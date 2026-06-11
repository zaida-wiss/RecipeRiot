export const optimizeImageUrl = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';

  // Lokalt (development): returnera original URL
  // På Vercel (production): använd Image Optimization automatiskt
  if (!import.meta.env.PROD) {
    return url;
  }

  // Production: använd Vercel Image Optimization
  // Dokumentation: https://vercel.com/docs/image-optimization
  const encodedUrl = encodeURIComponent(url);
  return `/_vercel/image?url=${encodedUrl}&w=${width}&q=75&f=webp`;
};

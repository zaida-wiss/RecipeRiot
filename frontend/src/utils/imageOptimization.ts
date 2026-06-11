export const optimizeImageUrl = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';

  // Använd Vercel Image Optimization (inbyggt & gratis)
  // Dokumentation: https://vercel.com/docs/image-optimization
  const encodedUrl = encodeURIComponent(url);
  return `/_vercel/image?url=${encodedUrl}&w=${width}&q=75&f=webp`;
};

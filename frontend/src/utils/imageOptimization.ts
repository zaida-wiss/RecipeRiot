export const optimizeImageUrl = (url: string | undefined, width: number = 400): string => {
  if (!url) return '';

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname === 'images.pexels.com') {
    parsed.searchParams.set('auto', 'compress');
    parsed.searchParams.set('cs', 'tinysrgb');
    parsed.searchParams.set('fm', 'webp');
    parsed.searchParams.set('w', String(width));
    return parsed.toString();
  }

  if (parsed.hostname === 'images.unsplash.com' || parsed.hostname === 'plus.unsplash.com') {
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fm', 'webp');
    parsed.searchParams.set('q', '75');
    parsed.searchParams.set('w', String(width));
    return parsed.toString();
  }

  return url;
};

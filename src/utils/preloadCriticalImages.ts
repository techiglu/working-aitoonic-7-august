// Preload critical images for better LCP
export function preloadCriticalImages() {
  if (typeof window === 'undefined') return;

  const criticalImages = [
    'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=1200',
    'https://i.imgur.com/ZXqf6Kx.png',
    'https://i.imgur.com/NXyUxX7.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Call this function early in the app lifecycle
if (typeof window !== 'undefined') {
  preloadCriticalImages();
}
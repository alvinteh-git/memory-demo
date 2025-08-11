import { useState, useEffect } from 'react';

export type LayoutType = 'diamond' | 'line';

/**
 * Hook to determine responsive layout based on viewport dimensions
 * Returns 'line' for mobile landscape, 'diamond' for all other layouts
 */
export const useResponsiveLayout = (): LayoutType => {
  const [layout, setLayout] = useState<LayoutType>('diamond');
  
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Mobile landscape: use line layout when width > height and on smaller screens
      if (aspectRatio > 1.2 && (width < 1024 || height < 600)) {
        setLayout('line');
      } else {
        setLayout('diamond');
      }
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);
  
  return layout;
};
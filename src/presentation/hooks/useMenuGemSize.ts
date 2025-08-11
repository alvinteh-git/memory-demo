import { useState, useEffect } from 'react';

/**
 * Hook to determine gem size for menu based on viewport height
 */
export const useMenuGemSize = (): number => {
  const [menuGemSize, setMenuGemSize] = useState(62);

  useEffect(() => {
    const handleResize = () => {
      // Menu gem sizing based on viewport height
      if (window.innerHeight < 500) {
        setMenuGemSize(40);
      } else if (window.innerHeight < 700) {
        setMenuGemSize(50);
      } else {
        setMenuGemSize(62);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return menuGemSize;
};
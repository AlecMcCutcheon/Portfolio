import React, { createContext, useContext, useState, useEffect } from 'react';

interface ScrollDirectionContextType {
  scrollDirection: 'up' | 'down';
}

const ScrollDirectionContext = createContext<ScrollDirectionContextType>({
  scrollDirection: 'down'
});

export const ScrollDirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) > 10) { // Minimum scroll distance
        const newDirection = scrollY > lastScrollY && scrollY > 100 ? 'down' : 
                           scrollY < lastScrollY ? 'up' : scrollDirection;
        
        if (newDirection !== scrollDirection) {
          setScrollDirection(newDirection);
        }
        setLastScrollY(scrollY);
      }
    };

    // Set initial scroll position
    setLastScrollY(window.scrollY);

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [lastScrollY]);

  return (
    <ScrollDirectionContext.Provider value={{ scrollDirection }}>
      {children}
    </ScrollDirectionContext.Provider>
  );
};

export const useScrollDirection = () => {
  const context = useContext(ScrollDirectionContext);
  if (!context) {
    throw new Error('useScrollDirection must be used within a ScrollDirectionProvider');
  }
  return context;
};

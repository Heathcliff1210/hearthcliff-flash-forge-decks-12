
import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si l'appareil est mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Vérifier d'abord au chargement
    checkMobile();

    // Ajouter l'écouteur pour les changements de taille
    window.addEventListener('resize', checkMobile);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}

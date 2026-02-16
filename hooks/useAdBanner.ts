import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour gérer l'affichage de la bannière publicitaire
 * - Première apparition: 30 secondes après le démarrage
 * - Apparitions suivantes: toutes les 2 minutes
 */
export const useAdBanner = () => {
  const [showAd, setShowAd] = useState(false);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recurringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasShownFirstAd = useRef(false);

  useEffect(() => {
    // Première apparition après 30 secondes
    initialTimerRef.current = setTimeout(() => {
      setShowAd(true);
      hasShownFirstAd.current = true;

      // Après la première apparition, configurer l'intervalle de 2 minutes
      recurringTimerRef.current = setInterval(() => {
        setShowAd(true);
      }, 2 * 60 * 1000); // 2 minutes en millisecondes
    }, 30 * 1000); // 30 secondes en millisecondes

    // Cleanup
    return () => {
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
      }
      if (recurringTimerRef.current) {
        clearInterval(recurringTimerRef.current);
      }
    };
  }, []);

  const closeAd = () => {
    setShowAd(false);
  };

  return {
    showAd,
    closeAd,
  };
};

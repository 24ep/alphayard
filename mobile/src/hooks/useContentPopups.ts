import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ContentPage, contentService } from '../services/ContentService';

interface UseContentPopupsReturn {
  popupContent: ContentPage | null;
  showPopup: boolean;
  dismissPopup: () => void;
  refreshPopups: () => Promise<void>;
}

export const useContentPopups = (): UseContentPopupsReturn => {
  const [popupContent, setPopupContent] = useState<ContentPage | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTimer, setPopupTimer] = useState<NodeJS.Timeout | null>(null);

  const loadPopupContent = useCallback(async () => {
    try {
      const popups = await contentService.getPopupContent();
      
      if (popups.length > 0) {
        // Get the first popup (you could implement priority logic here)
        const popup = popups[0];
        setPopupContent(popup);
        
        // Handle popup trigger
        if (popup.mobileDisplay.popupTrigger === 'immediate') {
          setShowPopup(true);
        } else if (popup.mobileDisplay.popupTrigger === 'after_delay') {
          const delay = popup.mobileDisplay.popupDelay || 5000;
          const timer = setTimeout(() => {
            setShowPopup(true);
          }, delay);
          setPopupTimer(timer);
        }
      }
    } catch (error) {
      console.error('Error loading popup content:', error);
    }
  }, []);

  const dismissPopup = useCallback(() => {
    setShowPopup(false);
    if (popupTimer) {
      clearTimeout(popupTimer);
      setPopupTimer(null);
    }
  }, [popupTimer]);

  const refreshPopups = useCallback(async () => {
    await loadPopupContent();
  }, [loadPopupContent]);

  // Load popup content on mount
  useEffect(() => {
    loadPopupContent();
  }, [loadPopupContent]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !showPopup) {
        // Reload popup content when app becomes active
        loadPopupContent();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [loadPopupContent, showPopup]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimer) {
        clearTimeout(popupTimer);
      }
    };
  }, [popupTimer]);

  return {
    popupContent,
    showPopup,
    dismissPopup,
    refreshPopups,
  };
};

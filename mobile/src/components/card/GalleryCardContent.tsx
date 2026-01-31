import React from 'react';
import GalleryScreen from '../../screens/main/GalleryScreen';

interface GalleryCardContentProps {
  darkMode?: boolean;
}

const GalleryCardContent: React.FC<GalleryCardContentProps> = ({ darkMode }) => {
  return <GalleryScreen embedded darkMode={darkMode} />;
};

export default GalleryCardContent;



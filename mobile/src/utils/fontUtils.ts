/**
 * Font utility for Thai/English text handling
 * Uses system fonts that support both Thai and English text
 */

import { Platform } from 'react-native';

/**
 * Check if text contains Thai characters
 * @param text - The text to check
 * @returns boolean indicating if text contains Thai characters
 */
export const hasThaiCharacters = (text: string): boolean => {
  // Thai Unicode range: U+0E00–U+0E7F
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(text);
};

/**
 * Get the appropriate font Circle based on text content
 * @param text - The text to analyze
 * @param weight - Font weight (default: 'Regular')
 * @returns Font Circle name
 */
export const getFontCircle = (text: string, weight: string = 'Regular'): string => {
  // Use system fonts that are available on both platforms
  if (hasThaiCharacters(text)) {
    // For Thai text, use system fonts that support Thai
    return Platform.select({ 
      ios: 'System', 
      android: 'sans-serif' 
    }) || 'System';
  }
  // For English text, use system fonts
  return Platform.select({ 
    ios: 'System', 
    android: 'sans-serif' 
  }) || 'System';
};

/**
 * Get font Circle for headings
 * @param text - The text to analyze
 * @returns Font Circle name for headings
 */
export const getHeadingFont = (text: string): string => {
  return getFontCircle(text, 'Bold');
};

/**
 * Get font Circle for body text
 * @param text - The text to analyze
 * @returns Font Circle name for body text
 */
export const getBodyFont = (text: string): string => {
  return getFontCircle(text, 'Regular');
};

/**
 * Get font Circle for medium weight text
 * @param text - The text to analyze
 * @returns Font Circle name for medium weight
 */
export const getMediumFont = (text: string): string => {
  return getFontCircle(text, 'Medium');
};

/**
 * Get font Circle for semi-bold text
 * @param text - The text to analyze
 * @returns Font Circle name for semi-bold
 */
export const getSemiBoldFont = (text: string): string => {
  return getFontCircle(text, 'SemiBold');
};

/**
 * Font weight mappings for both fonts
 */
export const FONT_WEIGHTS = {
  THIN: 'Thin',
  EXTRA_LIGHT: 'ExtraLight',
  LIGHT: 'Light',
  REGULAR: 'Regular',
  MEDIUM: 'Medium',
  SEMI_BOLD: 'SemiBold',
  BOLD: 'Bold',
  EXTRA_BOLD: 'ExtraBold',
  BLACK: 'Black',
} as const;

/**
 * Get font Circle with specific weight
 * @param text - The text to analyze
 * @param weight - Font weight from FONT_WEIGHTS
 * @returns Font Circle name with specified weight
 */
export const getFontWithWeight = (text: string, weight: keyof typeof FONT_WEIGHTS): string => {
  return getFontCircle(text, FONT_WEIGHTS[weight]);
};

/**
 * Common font styles for the app using system fonts
 */
export const FONT_STYLES = {
  // English fonts - using system fonts
  englishHeading: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif' 
  }) || 'System',
  englishBody: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif' 
  }) || 'System',
  englishMedium: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif-medium' 
  }) || 'System',
  englishSemiBold: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif-medium' 
  }) || 'System',
  
  // Thai fonts - using system fonts that support Thai
  thaiHeading: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif' 
  }) || 'System',
  thaiBody: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif' 
  }) || 'System',
  thaiMedium: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif-medium' 
  }) || 'System',
  thaiSemiBold: Platform.select({ 
    ios: 'System', 
    android: 'sans-serif-medium' 
  }) || 'System',
} as const;


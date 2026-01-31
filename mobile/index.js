// CRITICAL: Polyfill MUST be the absolute first thing that runs
// import './src/utils/platformConstantsPolyfill';
// import 'react-native-gesture-handler'; // Required for react-navigation
// import { enableScreens } from 'react-native-screens';
// enableScreens();
// Suppress non-critical Jimp errors
// import './src/utils/jimpErrorHandler';
// Then load other polyfills
// import './src/utils/webPolyfills';


import App from './App';
import { AppRegistry } from 'react-native';
// registerRootComponent(App);
AppRegistry.registerComponent('main', () => App);

import { AppRegistry } from 'react-native';
import App from './App';

// Register the main component
AppRegistry.registerComponent('main', () => App);

// Run the application
AppRegistry.runApplication('main', {
  rootTag: document.getElementById('root')
}); 
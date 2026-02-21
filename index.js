import React from 'react';
import { AppRegistry } from 'react-native-web';
import App from './src/App';

// Register the app
AppRegistry.registerComponent('App', () => App);

// Run the app
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root')
});

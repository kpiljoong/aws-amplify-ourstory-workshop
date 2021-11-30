import { StatusBar } from 'expo-status-bar';
import React from 'react';

// Add import statements
import Amplify, { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native';
import AWSCONFIG from './src/aws-exports.js';

import { 
  NativeBaseProvider,
  Center,
  Text
} from 'native-base';

import Constants from 'expo-constants';

import Feed from './src/Feed';

// Configure Amplify (place it between import and App function definition.
Amplify.configure({
   ...AWSCONFIG,
   Analytics: { 
       disabled: true
   }
});

// Remove direct export statement for App function
function App() {
  return (
    <NativeBaseProvider>
      <Center px="3" style={{ paddingTop: Constants.statusBarHeight }}>
        <Feed />
      </Center>
      <StatusBar style="auto" />
    </NativeBaseProvider>
  );
}

// Export App function wrapping Authenticator
export default withAuthenticator(App, false);
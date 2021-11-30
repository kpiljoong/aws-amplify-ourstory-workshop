import { StatusBar } from 'expo-status-bar';
import React from 'react';

import Amplify, { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native';
import AWSCONFIG from './src/aws-exports.js';

import { 
  NativeBaseProvider,
  Center,
} from 'native-base';

import Constants from 'expo-constants';

import Feed from './src/Feed';

import { InAppNotificationProvider } from 'react-native-in-app-notification';

Amplify.configure({
   ...AWSCONFIG,
   Analytics: { 
       disabled: true
   }
});

function App() {
  return (
    <InAppNotificationProvider>
      <NativeBaseProvider>
        <Center style={{ paddingTop: Constants.statusBarHeight }}>
          <Feed />
        </Center>
        <StatusBar style="auto" />
      </NativeBaseProvider>
    </InAppNotificationProvider>
  );
}

export default withAuthenticator(App, false);
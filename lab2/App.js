import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import AWSCONFIG from './src/aws-exports.js';

Amplify.configure({
   ...AWSCONFIG,
   Analytics: { 
       disabled: true
   }
});

function App() {
  return (
    <View style={styles.container}>
      <Text>Hi AWS!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withAuthenticator(App, false);

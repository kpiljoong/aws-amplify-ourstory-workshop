import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import AWSCONFIG from './src/aws-exports';

Amplify.configure(AWSCONFIG);

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
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
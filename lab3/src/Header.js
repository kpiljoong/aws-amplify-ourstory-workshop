import React from 'react';

import { 
    View, Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

class Header extends React.Component {
  
  render() {
    return (
      <View style={styles.header}>
        <TouchableOpacity />
        <Text style={styles.title}>OurStory</Text>
        <TouchableOpacity />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingLeft: 7,
    paddingRight: 7
  },
  title: {
    fontWeight: 'bold', 
    fontSize: 30
  }
})

export default Header
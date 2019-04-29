import React from 'react';

import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Card } from 'native-base';

import { S3Image } from 'aws-amplify-react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

class PostCard extends React.Component {

  getCurrentItem = () => 
    this.props.posts.filter(post => post.file.key === this.props.id)[0];
  
  getUsername = () => this.getCurrentItem().username;

  render () {
    return (
      <Card>
        <View style={styles.cardInfo}>
          <Text style={styles.username}>{ this.getUsername() }</Text>
          <TouchableOpacity onPress={this.props.onOptionsPressed}>
            <Ionicons name="ios-more" size={30} color="black" style={styles.actionButton} />
          </TouchableOpacity>
        </View>
        <S3Image style={styles.image} imgKey={this.props.id} />
      </Card>
      )
    }
  }
  
  let width = Dimensions.get('window').width;
  
  const styles = StyleSheet.create({
    cardInfo: {
      height: 50,
      flexDirection: 'row'
    },
    username: {
      fontWeight: 'bold',
      height: 60,
      lineHeight: 60,
      flex: 1,
      marginLeft: 8
    },
    image: {
      width: width, 
      height: width
    },
    actionButton: {
      lineHeight: 60, 
      marginRight: 15
    }
  })
  
  export default PostCard
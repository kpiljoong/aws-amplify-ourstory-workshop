import React from 'react';

import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Card } from 'native-base';

import { S3Image } from 'aws-amplify-react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

class PostCard extends React.Component {

  getCurrentItem = () => 
    this.props.posts.filter(post => post.file.key === this.props.id)[0];
  
  getUsername = () => this.getCurrentItem().username;

  hasLikes = () => this.getNumberOfLikes() !== 0;

  didUserLike = () => this.hasLikes() && this.getCurrentItem().likes.items.filter(like => like.userId === this.props.userId).length !== 0;

  getNumberOfLikes = () => this.getCurrentItem() && this.getCurrentItem().likes.items.length;

  render () {
    let likeIcon = null;

    if (this.didUserLike()) {
      likeIcon = <Ionicons name="ios-heart" size={30} color="red" style={styles.heartIcon} />;
    } else {
      likeIcon = <Ionicons name="ios-heart-empty" size={30} color="black" style={styles.heartIcon} />;
    }

    return (
      <Card>
        <View style={styles.cardInfo}>
          <Text style={styles.username}>{ this.getUsername() }</Text>
          <TouchableOpacity onPress={this.props.onOptionsPressed}>
            <Ionicons name="ios-more" size={30} color="black" style={styles.actionButton} />
          </TouchableOpacity>
        </View>
        
        <S3Image style={styles.image} imgKey={this.props.id} />

        <View style={styles.bottomActionBar}>
          <TouchableOpacity onPress={this.props.onLikePressed}>
            {likeIcon}
          </TouchableOpacity>
        </View>

        {
          this.hasLikes() &&
          <View style={styles.bottomLikeMessage}>
            <Text>좋아요 {this.getNumberOfLikes()}개</Text>
          </View>
        }
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
    },
    bottomActionBar: {
      height: 40, 
      flexDirection: 'row'
    },
    heartIcon: {
      marginTop: 5, 
      marginLeft: 10
    },
    bottomLikeMessage: {
      marginLeft: 10,
      marginBottom: 5
    }
  })
  
  export default PostCard
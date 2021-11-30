import React from 'react';

import { Dimensions } from 'react-native';

import {
    Text,
    VStack,
    HStack,
    Menu,
    Pressable,
	Icon,
	IconButton,
} from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';

import { S3Image } from 'aws-amplify-react-native';

const windowWidth = Dimensions.get('window').width;

import Storage from '@aws-amplify/storage';

Storage.configure({
    customPrefix: {
        private: 'resized-public/'
    },
});

class PostCard extends React.Component {

    getCurrentItem = () => this.props.post
  
    getUsername = () => this.getCurrentItem().username
    
    isOwnPost = () => {
      return this.props.userId == this.props.post.userId;
    }
    
    getNumberOfLikes = () => this.getCurrentItem() && this.getCurrentItem().likes.items.length;
    
    hasLikes = () => this.getNumberOfLikes() !== 0;
    
    isOwnLike = () => this.hasLikes() && this.getCurrentItem().likes.items.filter(like => like.userId === this.props.userId).length !== 0;


    render () {
        let likeIcon;
        if (this.isOwnLike()) {
            likeIcon = <Icon as={<MaterialIcons name='favorite' />} color='#FF0000' size='md' />
        } else {
            likeIcon = <Icon as={<MaterialIcons name='favorite-border' />} color='#FF0000' size='md' />
        }
        let imgKey = this.getCurrentItem().file.key.replace('original', 'resized');
        console.log('imgKey', imgKey);
        return (
            <VStack>
                <HStack justifyContent='space-between' alignItems='center'>
                    <Text style={{ fontWeight: 'bold', height: 50, lineHeight: 50, marginLeft: 10 }}>
                        { this.getUsername() }
                    </Text>
                    { this.isOwnPost() && 
                        <Menu w="100"
                            trigger={(triggerProps) => {
                                return (
                                    <Pressable {...triggerProps}>
                                        <Icon as={<MaterialIcons name='more-horiz' />} color='black' size='md' />
                                    </Pressable>
                                )
                            }}>
                            <Menu.Item onPress={() => this.props.deletePost(this.props.post.file.key) }>Delete</Menu.Item>
                        </Menu>
                    }
                </HStack>
                <HStack>
                    <S3Image imgKey={imgKey} style={{ height:windowWidth, width:windowWidth }} />
                </HStack>
                <HStack>
                    <IconButton 
                        onPress={() => this.props.onLikePressed(this.props.post.file.key)}
                        icon={likeIcon}
                        color='#FF0000' size='md' />
                </HStack>
                { this.hasLikes() &&
                    <HStack>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} ml='3'>Likes {this.getNumberOfLikes()}</Text>
                    </HStack>
                }
            </VStack>
        )
    }
}

export default PostCard
